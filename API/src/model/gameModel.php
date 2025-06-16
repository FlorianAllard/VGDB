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
