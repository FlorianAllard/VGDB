<?php

require_once __DIR__ . '/../services/_debug.php';
require_once __DIR__ . '/../services/_pdo.php';
require_once __DIR__ . '/../services/_igdb.php';
require_once __DIR__ . '/../services/_utilities.php';

/**Fetch games from IGDB, insert into DB, and return them.
 * @param PDO $pdo
 * @param array $ids
 * @return array
 */
function importGames(array $ids)
{
    $createdGames = [];
    $games = requestGames($ids);
    $pdo = pdoConnection();

    foreach ($games as $rawGame) {
        $game = formatGame($rawGame);

        // Insert main game data
        $gameData = $game;
        unset(
            $gameData['cover'],
            $gameData['genres'],
            $gameData['platforms'],
            $gameData['modes'],
            $gameData['perspectives'],
            $gameData['themes'],
            $gameData['companies'],
            $gameData['engines'],
            $gameData['series'],
            $gameData['franchises'],
            $gameData['languages'],
            $gameData['age_ratings'],
            $gameData['regional_releases'],
            $gameData['artworks'],
            $gameData['screenshots'],
            $gameData['videos'],
            $gameData['websites'],
        );
        $covers = getBestCovers($game);
        foreach ($covers as $key => $value) {
            $gameData[$key] = $value;
        }
        insertInto("games", $gameData, $pdo);

        // Insert genres and relation
        foreach ($game['genres'] ?? [] as $rawGenre) {
            $genre = formatGenre($rawGenre);
            insertInto("genres", $genre, $pdo);
            insertInto("games_to_genres", [
                'game_id' => $game['id'],
                'genre_id' => $genre['id']
            ], $pdo);
        }

        // Insert platforms and relation
        foreach ($game['platforms'] ?? [] as $rawPlatform) {
            $platform = formatPlatform($rawPlatform);
            $platformData = $platform;
            if ($platform['family']) {
                insertInto("platform_families", $platform['family'], $pdo);
                $platformData['family'] = $platform['family']['id'];
            } else {
                $platformData['family'] = null;
            }
            insertInto("platforms", $platformData, $pdo);
            insertInto("games_to_platforms", [
                'game_id' => $game['id'],
                'platform_id' => $platform['id']
            ], $pdo);
        }

        // Insert modes and relation
        foreach ($game['modes'] ?? [] as $rawMode) {
            $mode = formatMode($rawMode);
            insertInto("modes", $mode, $pdo);
            insertInto("games_to_modes", [
                'game_id' => $game['id'],
                'mode_id' => $mode['id']
            ], $pdo);
        }

        // Insert perspectives and relation
        foreach ($game['perspectives'] ?? [] as $rawPerspective) {
            $perspective = formatPerspective($rawPerspective);
            insertInto("perspectives", $perspective, $pdo);
            insertInto("games_to_perspectives", [
                'game_id' => $game['id'],
                'perspective_id' => $perspective['id']
            ], $pdo);
        }

        // Insert themes and relation
        foreach ($game['themes'] ?? [] as $rawTheme) {
            $theme = formatTheme($rawTheme);
            insertInto("themes", $theme, $pdo);
            insertInto("games_to_themes", [
                'game_id' => $game['id'],
                'theme_id' => $theme['id']
            ], $pdo);
        }

        // Insert companies and relation
        foreach ($game['companies'] ?? [] as $rawCompany) {
            $company = formatCompany($rawCompany);
            // Insert company (only id and name)
            insertInto("companies", [
                'id' => $company['id'],
                'name' => $company['name']
            ], $pdo);

            // Insert relations based on roles
            if ($company['developer']) {
                insertInto("games_to_developers", [
                    'game_id' => $game['id'],
                    'company_id' => $company['id']
                ], $pdo);
            }
            if ($company['supporting']) {
                insertInto("games_to_supporting", [
                    'game_id' => $game['id'],
                    'company_id' => $company['id']
                ], $pdo);
            }
            if ($company['publisher']) {
                insertInto("games_to_publishers", [
                    'game_id' => $game['id'],
                    'company_id' => $company['id']
                ], $pdo);
            }
        }

        // Insert engines and relation
        foreach ($game['engines'] ?? [] as $raw) {
            $engine = formatTheme($raw);
            insertInto("engines", $engine, $pdo);
            insertInto("games_to_engines", [
                'game_id' => $game['id'],
                'engine_id' => $engine['id']
            ], $pdo);
        }

        // Insert series and relation
        foreach ($game['series'] ?? [] as $raw) {
            $series = formatSeries($raw);
            insertInto("series", $series, $pdo);
            insertInto("games_to_series", [
                'game_id' => $game['id'],
                'series_id' => $series['id']
            ], $pdo);
        }

        // Insert series and relation
        foreach ($game['franchises'] ?? [] as $raw) {
            $franchise = formatFranchise($raw);
            insertInto("franchises", $franchise, $pdo);
            insertInto("games_to_franchises", [
                'game_id' => $game['id'],
                'franchise_id' => $franchise['id']
            ], $pdo);
        }

        // Insert languages and relation
        foreach ($game['languages'] ?? [] as $raw) {
            $language = formatLanguage($raw);
            // Insert language (only id and name)
            insertInto("languages", [
                'id' => $language['id'],
                'name' => $language['name']
            ], $pdo);

            // Insert relations based on support
            if ($language['audio']) {
                insertInto("games_to_audio", [
                    'game_id' => $game['id'],
                    'language_id' => $language['id']
                ], $pdo);
            }
            if ($language['subtitles']) {
                insertInto("games_to_subtitles", [
                    'game_id' => $game['id'],
                    'language_id' => $language['id']
                ], $pdo);
            }
            if ($language['interface']) {
                insertInto("games_to_interfaces", [
                    'game_id' => $game['id'],
                    'language_id' => $language['id']
                ], $pdo);
            }
        }

        // Insert age ratings and relation
        foreach ($game['age_ratings'] ?? [] as $raw) {
            $ageRating = formatAgeRating($raw);
            $ageRatingData = $ageRating;

            $system = $ageRating['system'];
            insertInto('age_rating_systems', $system, $pdo);

            unset($ageRatingData['system'], $ageRatingData['contents']);
            $ageRatingData['game_id'] = $game['id'];
            $agrtg = insertInto('age_ratings', $ageRatingData, $pdo)[0];

            foreach ($ageRating['contents'] as $content) {
                insertInto('age_rating_contents', $content, $pdo);
                insertInto('age_ratings_to_contents', [
                    'rating_id' => $agrtg['id'],
                    'content_id' => $content['id']
                ], $pdo);
            }
        }

        // Insert regional releases and relation
        foreach ($game['regional_releases'] ?? [] as $raw) {
            $release = formatRegionalRelease($raw);
            $releaseData = $release;
            unset(
                $releaseData['platform_id'],
                $releaseData['region'],
            );

            $type = insertInto('release_types', $release['type'], $pdo)[0];
            $releaseData['type_id'] = $type['id'];
            $rls = insertInto('regional_releases', $releaseData, $pdo)[0];
            insertInto('regions', $release['region'], $pdo);

            insertInto('regional_releases_to_platforms', [
                'release_id' => $rls['id'],
                'platform_id' => $release['platform_id'],
            ], $pdo);
            insertInto('regional_releases_to_regions', [
                'release_id' => $rls['id'],
                'region_id' => $release['region']['id'],
            ], $pdo);
        }

        // Insert artworks and relation
        foreach ($game['artworks'] ?? [] as $raw) {
            $artwork = formatImage($raw);
            insertInto('artworks', $artwork, $pdo);
            insertInto('games_to_artworks', [
                'game_id' => $game['id'],
                'artwork_id' => $artwork['id'],
            ], $pdo);
        }

        // Insert screenshots and relation
        foreach ($game['screenshots'] ?? [] as $raw) {
            $screenshot = formatImage($raw);
            insertInto('screenshots', $screenshot, $pdo);
            insertInto('games_to_screenshots', [
                'game_id' => $game['id'],
                'screenshot_id' => $screenshot['id'],
            ], $pdo);
        }

        // Insert videos and relation
        foreach ($game['videos'] ?? [] as $raw) {
            $video = formatVideo($raw);
            insertInto('videos', $video, $pdo);
            insertInto('games_to_videos', [
                'game_id' => $game['id'],
                'video_id' => $video['id'],
            ], $pdo);
        }

        // Insert websites and relation
        foreach ($game['websites'] ?? [] as $raw) {
            $website = formatWebsite($raw);
            insertInto('websites', $website, $pdo);
            insertInto('games_to_websites', [
                'game_id' => $game['id'],
                'website_id' => $website['id'],
            ], $pdo);
        }

        $createdGames[] = $gameData;
    }
}

/** Format raw game data from IGDB.
 * @param array $raw
 * @return array
 */
function formatGame(array $raw): array
{
    return [
        'id' => $raw['id'],
        'name' => $raw['name'],
        'official_release_date' => $raw['first_release_date'] ?? 0,
        'summary' => $raw['summary'] ?? "",
        'premise' => $raw['storyline'] ?? "",
        'cover' => $raw['cover'] ?? "",
        'portrait' => "",
        'landscape' => "",
        'hero' => "",
        'genres' => $raw['genres'] ?? [],
        'platforms' => $raw['platforms'] ?? [],
        'modes' => $raw['game_modes'] ?? [],
        'perspectives' => $raw['player_perspectives'] ?? [],
        'themes' => $raw['themes'] ?? [],
        'companies' => $raw['involved_companies'] ?? [],
        'engines' => $raw['game_engines'] ?? [],
        'series' => $raw['collections'] ?? [],
        'franchises' => $raw['franchises'] ?? [],
        'languages' => $raw['language_supports'] ?? [],
        'age_ratings' => $raw['age_ratings'] ?? [],
        'regional_releases' => $raw['release_dates'] ?? [],
        'artworks' => $raw['artworks'] ?? [],
        'screenshots' => $raw['screenshots'] ?? [],
        'videos' => $raw['videos'] ?? [],
        'websites' => $raw['websites'] ?? [],
        'createdAt' => time(),
        'updatedAt' => time()
    ];
}

/**Format raw genre data.
 * @param array $raw
 * @return array
 */
function formatGenre(array $raw): array
{
    return [
        'id' => $raw['id'],
        'name' => $raw['name']
    ];
}

/** Format raw platform data.
 * @param array $raw
 * @return array
 */
function formatPlatform(array $raw): array
{
    $family = null;
    if (!empty($raw['platform_family'])) {
        $family = [
            'id' => $raw['platform_family']['id'],
            'name' => $raw['platform_family']['name']
        ];
    }
    return [
        'id' => $raw['id'],
        'name' => $raw['name'],
        'generation' => $raw['generation'] ?? 0,
        'family_id' => $family
    ];
}

/** Format raw mode data.
 * @param array $raw
 * @return array
 */
function formatMode(array $raw): array
{
    return [
        'id' => $raw['id'],
        'name' => $raw['name']
    ];
}

/** Format raw perspective data.
 * @param array $raw
 * @return array
 */
function formatPerspective(array $raw): array
{
    return [
        'id' => $raw['id'],
        'name' => $raw['name']
    ];
}

/** Format raw theme data.
 * @param array $raw
 * @return array
 */
function formatTheme(array $raw): array
{
    return [
        'id' => $raw['id'],
        'name' => $raw['name']
    ];
}

/** Format raw company data.
 * @param array $raw
 * @return array
 */
function formatCompany(array $raw): array
{
    return [
        'id' => $raw['company']['id'],
        'name' => $raw['company']['name'],
        'developer' => $raw['developer'],
        'supporting' => $raw['supporting'],
        'publisher' => $raw['publisher'],
    ];
}

/** Format raw engine data.
 * @param array $raw
 * @return array
 */
function formatEngine(array $raw): array
{
    return [
        'id' => $raw['id'],
        'name' => $raw['name']
    ];
}

/** Format raw series data.
 * @param array $raw
 * @return array
 */
function formatSeries(array $raw): array
{
    return [
        'id' => $raw['id'],
        'name' => $raw['name']
    ];
}

/**Format raw franchise data.
 * @param array $raw
 * @return array
 */
function formatFranchise(array $raw): array
{
    return [
        'id' => $raw['id'],
        'name' => $raw['name']
    ];
}

/** Format raw language data.
 * @param array $raw
 * @return array
 */
function formatLanguage(array $raw): array
{
    return [
        'id' => $raw['language']['id'],
        'name' => $raw['language']['name'],
        'audio' => $raw['language_support_type']['name'] == "Audio",
        'subtitles' => $raw['language_support_type']['name'] == "Subtitles",
        'interface' => $raw['language_support_type']['name'] == "Interface",
    ];
}

/**Format raw age rating data.
 * @param array $raw
 * @return array
 */
function formatAgeRating(array $raw): array
{
    $contents = [];
    foreach ($raw['rating_content_descriptions'] ?? [] as $rawContent) {
        $contents[] = [
            'id' => $rawContent['id'],
            'description' => $rawContent['description'],
        ];
    }

    $countries = [
        'ESRB' => "USA & Canada",
        'PEGI' => "Europe",
        'CERO' => "Japan",
        'USK' => "Germany",
        'GRAC' => "South Korea",
        'CLASS_IND' => "Brazil",
        'ACB' => "Australia",
    ];

    return [
        'rating' => $raw['rating'],
        'system_id' => $raw['organization']['id'],
        'system' => [
            'id' => $raw['organization']['id'],
            'name' => $raw['organization']['name'],
            'country' => $countries[$raw['organization']['name']],
        ],
        'contents' => $contents,
    ];
}

/** Format raw regional release data.
 * @param array $raw
 * @return array
 */
function formatRegionalRelease(array $raw): array
{
    return [
        'date' => $raw['date'] ?? "",
        'game_id' => $raw['game'],
        'type' => [
            'name' => $raw['status']['name'] ?? "Full Release"
        ],
        'platform_id' => $raw['platform']['id'],
        'region' => [
            'id' => $raw['release_region']['id'],
            'name' => ucwords(str_replace('_', ' ', $raw['release_region']['region'])),
        ],
    ];
}

/** Format raw image data.
 * @param array $raw
 * @return array
 */
function formatImage(array $raw): array
{
    return [
        'id' => $raw['id'],
        'url' => 'https://images.igdb.com/igdb/image/upload/t_1080p/' . $raw['image_id'] . '.webp',
    ];
}

/** Format raw video data.
 * @param array $raw
 * @return array
 */
function formatVideo(array $raw): array
{
    return [
        'id' => $raw['id'],
        'url' => 'https://www.youtube.com/embed/' . $raw['video_id'],
    ];
}

/** Format raw website data.
 * @param array $raw
 * @return array
 */
function formatWebsite(array $raw): array
{
    return [
        'id' => $raw['id'],
        'url' => $raw['url'],
    ];
}

/** Get the best available cover images for a game, preferring Steam images if available.
 * @param array $game The game data array (should include 'cover' and 'websites' keys).
 * @return array Associative array with keys: 'portrait', 'landscape', 'hero', 'logo'.
 */
function getBestCovers($game): array
{
    // Default to IGDB cover images if available
    $covers = [
        'portrait' => isset($game['cover']['image_id']) ? 'https://images.igdb.com/igdb/image/upload/t_cover_big/' . $game['cover']['image_id'] . '.webp' : null,
        'landscape' => isset($game['cover']['image_id']) ? 'https://images.igdb.com/igdb/image/upload/t_1080p/' . $game['cover']['image_id'] . '.webp' : null,
        'hero' => null,
        'logo' => null,
    ];

    // Try to find a Steam ID from the game's websites
    $steamId = null;
    foreach ($game['websites'] ?? [] as $website) {
        if (isset($website['url']) && str_contains($website['url'], 'steam')) {
            $steamId = basename(parse_url($website['url'], PHP_URL_PATH));
            break;
        }
    }

    // If a Steam ID is found, prefer Steam images if they exist
    if ($steamId) {
        $steamCovers = [
            'portrait' => 'https://steamcdn-a.akamaihd.net/steam/apps/' . $steamId . '/header.jpg',
            'landscape' => 'https://steamcdn-a.akamaihd.net/steam/apps/' . $steamId . '/library_600x900_2x.jpg',
            'hero' => 'https://steamcdn-a.akamaihd.net/steam/apps/' . $steamId . '/library_hero.jpg',
            'logo' => 'https://steamcdn-a.akamaihd.net/steam/apps/' . $steamId . '/logo.png',
        ];
        // Only use Steam images if they exist (checkImage returns true)
        foreach ($steamCovers as $key => $url) {
            if (checkImage($url)) {
                $covers[$key] = $url;
            }
        }
    }

    return $covers;
}

/** Insert or update a record in the database.
 * @param string $table
 * @param array $object
 * @param PDO $pdo
 * @return void
 */
function insertInto(string $table, array $object, PDO $pdo): array
{
    if (empty($object)) return [];

    $columns = array_keys($object);
    $placeholders = implode(',', array_fill(0, count($columns), '?'));

    // Exclude 'createdAt' from ON DUPLICATE KEY UPDATE clause
    $updateColumns = array_filter($columns, function ($col) {
        return $col !== 'createdAt';
    });

    $updateClause = implode(', ', array_map(function ($col) {
        return "`$col`=VALUES(`$col`)";
    }, $updateColumns));

    $stmt = $pdo->prepare("INSERT INTO `$table` (`" . implode('`,`', $columns) . "`) VALUES ($placeholders)
        ON DUPLICATE KEY UPDATE $updateClause
        RETURNING *");
    $stmt->execute(array_values($object));
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}