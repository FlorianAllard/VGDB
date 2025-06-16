<?php

require_once __DIR__.'/../services/_debug.php';
require_once __DIR__.'/../services/_pdo.php';
require_once __DIR__.'/../services/_igdb.php';

/**Fetch games by IDs. If not found in DB, fetch from IGDB and insert.
 * @param array $ids
 * @return array
 */
function getGames(array $ids): array {
    $pdo = pdoConnection();

    // Prepare placeholders for SQL IN clause
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT * FROM games WHERE id IN ($placeholders)");
    $stmt -> execute($ids);
    $games = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Find IDs not in DB
    $foundIds = array_column($games, 'id');
    $notFoundIds = array_diff($ids, $foundIds);

    // Get IDs of games older than 1 minute
    $updateDelay = time() - 1;
    foreach ($games as $game) {
        if (isset($game['updatedAt']) && $game['updatedAt'] < $updateDelay) {
            $notFoundIds[] = $game['id'];
        }
    }

    // Fetch and insert missing games
    $notFoundGames = [];
    if (!empty($notFoundIds)) {
        $notFoundGames = createGames($pdo, $notFoundIds);
    }

    return array_merge($games, $notFoundGames);
}

/**Fetch games from IGDB, insert into DB, and return them.
 * @param PDO $pdo
 * @param array $ids
 * @return array
 */
function createGames(PDO $pdo, array $ids): array {
    $createdGames = [];
    $games = requestGames($ids);

    foreach ($games as $rawGame) {
        $game = formatGame($rawGame);

        // Insert main game data
        $gameData = $game;
        unset(
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
        );
        insertInto("games", $gameData, $pdo);

        // Insert genres and relation
        foreach ($game['genres'] as $rawGenre) {
            $genre = formatGenre($rawGenre);
            insertInto("game_genres", $genre, $pdo);
            insertInto("games_to_genres", [
                'game_id' => $game['id'],
                'genre_id' => $genre['id']
            ], $pdo);
        }

        // Insert platforms and relation
        foreach ($game['platforms'] as $rawPlatform) {
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
        foreach ($game['modes'] as $rawMode) {
            $mode = formatMode($rawMode);
            insertInto("game_modes", $mode, $pdo);
            insertInto("games_to_modes", [
                'game_id' => $game['id'],
                'mode_id' => $mode['id']
            ], $pdo);
        }

        // Insert perspectives and relation
        foreach ($game['perspectives'] as $rawPerspective) {
            $perspective = formatPerspective($rawPerspective);
            insertInto("game_perspectives", $perspective, $pdo);
            insertInto("games_to_perspectives", [
                'game_id' => $game['id'],
                'perspective_id' => $perspective['id']
            ], $pdo);
        }

        // Insert themes and relation
        foreach ($game['themes'] as $rawTheme) {
            $theme = formatTheme($rawTheme);
            insertInto("game_themes", $theme, $pdo);
            insertInto("games_to_themes", [
            'game_id' => $game['id'],
            'theme_id' => $theme['id']
            ], $pdo);
        }

        // Insert companies and relation
        foreach ($game['companies'] as $rawCompany) {
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
        foreach ($game['engines'] as $raw) {
            $engine = formatTheme($raw);
            insertInto("game_engines", $engine, $pdo);
            insertInto("games_to_engines", [
                'game_id' => $game['id'],
                'engine_id' => $engine['id']
            ], $pdo);
        }

        // Insert series and relation
        foreach ($game['series'] as $raw) {
            $series = formatSeries($raw);
            insertInto("game_series", $series, $pdo);
            insertInto("games_to_series", [
                'game_id' => $game['id'],
                'series_id' => $series['id']
            ], $pdo);
        }

        // Insert series and relation
        foreach ($game['franchises'] as $raw) {
            $franchise = formatFranchise($raw);
            insertInto("game_franchises", $franchise, $pdo);
            insertInto("games_to_franchises", [
                'game_id' => $game['id'],
                'franchise_id' => $franchise['id']
            ], $pdo);
        }

        // Insert languages and relation
        foreach ($game['languages'] as $raw) {
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
        foreach ($game['age_ratings'] as $raw) {
            $ageRating = formatAgeRating($raw);
            $ageRatingData = $ageRating;
            
            $system = $ageRating['system'];
            insertInto('age_rating_systems', $system, $pdo);

            unset($ageRatingData['system'], $ageRatingData['contents']);
            $ageRatingData['game_id'] = $game['id'];
            insertInto('age_ratings', $ageRatingData, $pdo);

            foreach ($ageRating['contents'] as $content) {
                insertInto('age_rating_contents', $content, $pdo);
                insertInto('age_ratings_to_contents', [
                    'rating_id' => $ageRating['id'],
                    'content_id' => $content['id']
                ], $pdo);
            }
        }

        $createdGames[] = $gameData;
    }

    return $createdGames;
}

/**Format raw game data from IGDB.
 * @param array $raw
 * @return array
 */
function formatGame(array $raw): array {
    return [
        'id' => $raw['id'],
        'name' => $raw['name'],
        'official_release_date' => $raw['first_release_date'] ?? 0,
        'summary' => $raw['summary'] ?? "",
        'premise' => $raw['storyline'] ?? "",
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
        'createdAt' => time(),
        'updatedAt' => time()
    ];
}

/**Format raw genre data.
 * @param array $raw
 * @return array
 */
function formatGenre(array $raw): array {
    return [
        'id' => $raw['id'],
        'name' => $raw['name']
    ];
}

/**Format raw platform data.
 * @param array $raw
 * @return array
 */
function formatPlatform(array $raw): array {
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
        'family' => $family
    ];
}

/**Format raw mode data.
 * @param array $raw
 * @return array
 */
function formatMode(array $raw): array {
    return [
        'id' => $raw['id'],
        'name' => $raw['name']
    ];
}

/**Format raw perspective data.
 * @param array $raw
 * @return array
 */
function formatPerspective(array $raw): array {
    return [
        'id' => $raw['id'],
        'name' => $raw['name']
    ];
}

/**Format raw theme data.
 * @param array $raw
 * @return array
 */
function formatTheme(array $raw): array {
    return [
        'id' => $raw['id'],
        'name' => $raw['name']
    ];
}

/**Format raw company data.
 * @param array $raw
 * @return array
 */
function formatCompany(array $raw): array {
    return [
        'id' => $raw['company']['id'],
        'name' => $raw['company']['name'],
        'developer' => $raw['developer'],
        'supporting' => $raw['supporting'],
        'publisher' => $raw['publisher'],
    ];
}

/**Format raw engine data.
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

/**Format raw series data.
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

/**Format raw language data.
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
    foreach ($raw['rating_content_descriptions'] as $rawContent) {
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

/**Insert or update a record in the database.
 * @param string $table
 * @param array $object
 * @param PDO $pdo
 * @return void
 */
function insertInto(string $table, array $object, PDO $pdo): void {
    if (empty($object)) return;

    $columns = array_keys($object);
    $placeholders = implode(',', array_fill(0, count($columns), '?'));

    // Exclude 'createdAt' from ON DUPLICATE KEY UPDATE clause
    $updateColumns = array_filter($columns, function($col) {
        return $col !== 'createdAt';
    });

    $updateClause = implode(', ', array_map(function($col) {
        return "`$col`=VALUES(`$col`)";
    }, $updateColumns));

    $sql = "INSERT INTO `$table` (`" . implode('`,`', $columns) . "`) VALUES ($placeholders)
            ON DUPLICATE KEY UPDATE $updateClause";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array_values($object));
}
