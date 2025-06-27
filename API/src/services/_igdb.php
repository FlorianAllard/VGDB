<?php

require_once __DIR__ . '/_debug.php';

function fetchRawGames($ids) {
    $idsImploded = implode(',', $ids);
    return makeRequest(
        "games",
        "*, genres.*, websites.*, videos.*, collections.*, franchises.*, cover.*, player_perspectives.*, game_modes.*, themes.*, involved_companies.*, involved_companies.company.*, game_engines.*, platforms.*, platforms.platform_family.*, language_supports.*, language_supports.language.*, language_supports.language_support_type.*, age_ratings.*, age_ratings.rating_content_descriptions.*, age_ratings.organization.*, release_dates.*, release_dates.platform.*, release_dates.platform.platform_family.*, release_dates.release_region.*, release_dates.status.*, external_games.*, dlcs.*, dlcs.cover.*, expansions.*, expansions.cover.*, artworks.*, screenshots.*",
        "",
        count($ids),
        "id = (" . $idsImploded . ")"
    );
}

function requestTimesToBeat($games) {
    $ids = array_column($games, 'id');
    $idsImploded = implode(',', $ids);
    
    $timesToBeat = makeRequest(
        "game_time_to_beats",
        "*",
        "",
        count($ids),
        "game_id = (" . $idsImploded . ")"
    );

    foreach ($timesToBeat as &$ttb) {
        $game = array_filter($games, function($g) use ($ttb) {
            return $g['id'] == $ttb['game_id'];
        });
        $game = reset($game);
        $ttb['speedrun'] = getSpeedrun($game['slug']);
    }

    return $timesToBeat;
}

function makeRequest($endpoint, $fields = "", $sort = "", $limit = "", $where = "") {
    // Prepare body
    $body = "";
    if ($fields) $body .= "fields $fields;";
    if ($sort) $body .= " sort $sort;";
    if ($limit) $body .= " limit $limit;";
    if ($where) $body .= " where $where;";

    $clientID = $_ENV['IGDB_CLIENTID'];
    $token = authentification();

    // Prepare header
    $header = [
        "Client-ID: " . $clientID,
        "Authorization: Bearer " . $token,
        "Accept: application/json"
    ];

    // cURL
    $curl = curl_init("http://host.docker.internal:8010/proxy/$endpoint");
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $body);

    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($httpCode >= 200 && $httpCode < 300) {
        return json_decode($response, true);
    } else {
        debug_to_console("Failed to fetch $endpoint: $response");
        error_log("Failed to fetch $endpoint: $response");
        return null;
    }
}

function authentification() { 
    // Load token from DB
    $clientID = $_ENV['IGDB_CLIENTID'];
    $clientSecret = $_ENV['IGDB_CLIENTSECRET'];
    $pdo = pdoConnection();
    $sql = $pdo -> query("SELECT * FROM vgdb_authentification");
    $tokenData = $sql -> fetch();  

    $now = time();
    $token = $tokenData['token'] ?? null;
    $tokenCreation = $tokenData['createdAt'] ?? 0;
    $tokenDuration = $tokenData['expiresIn'] ?? 0;

    if(!$token || ($now - $tokenCreation) > $tokenDuration) {
        debug_to_console("Token expired. Refreshing...");
        $url = "https://id.twitch.tv/oauth2/token?client_id=$clientID&client_secret=$clientSecret&grant_type=client_credentials";

        // Set curl
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($curl);
        curl_close($curl);

        
        $data = json_decode($response, true);
        debug_to_console($data['access_token']);
        if (isset($data['access_token'])) {
            $token = $data['access_token'];
            $tokenCreation = $now;
            $tokenDuration = $data['expires_in'];

            // Save in DB
            if($tokenData) {
                $sql = $pdo -> query("UPDATE vgdb_authentification SET token=$token, createdAt=$tokenCreation, expiresIn=$tokenDuration");
            } else {
                $sql = $pdo -> query("INSERT INTO vgdb_authentification (token, createdAt, expiresIn) VALUES ('$token', '$tokenCreation', '$tokenDuration')");
            }
        } else {
            error_log("Failed to get IGDB token: " . $response);
            return null;
        }
    } else {
        // debug_to_console("Token still valid.");
    }

    return $token;
}

function getSpeedrun($name) {
    $url = "https://www.speedrun.com/api/v1/games?name=" . urlencode(str_replace('-', '_', $name));
    $response = file_get_contents($url);
    $speedrunData = json_decode($response, true);

    if (!empty($speedrunData['data'])) {
        $recordLink = null;
        foreach ($speedrunData['data'][0]['links'] as $link) {
            if ($link['rel'] === "records") {
                $recordLink = $link['uri'];
                break;
            }
        }
        if ($recordLink) {
            $recordResponse = file_get_contents($recordLink);
            $recordData = json_decode($recordResponse, true);
            if (!empty($recordData['data'][0]['runs'][0]['run']['times']['primary_t'])) {
                return $recordData['data'][0]['runs'][0]['run']['times']['primary_t'];
            }
        }
    }

    return null;
  }