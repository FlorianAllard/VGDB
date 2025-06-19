<?php

require_once __DIR__.'/../services/_debug.php';
require_once __DIR__.'/../services/_pdo.php';
require_once __DIR__.'/../services/_igdb.php';
require_once __DIR__.'/../services/_utilities.php';
require_once __DIR__.'/gameImport.php';
require_once __DIR__.'/gameExport.php';

/** Fetch games by IDs. If not found in DB, fetch from IGDB and insert.
 * @param array $ids
 * @return array
 */
function getGames(array $ids): array {
    $pdo = pdoConnection();

    // Prepare placeholders for SQL IN clause
    $games = exportGames($ids);

    // Find IDs not in DB
    $foundIds = array_column($games, 'id');
    $notFoundIds = array_diff($ids, $foundIds);

    // Get IDs of games older than 1 minute
    $updateDelay = time() - (60 * 60 * 24 * 7);
    foreach ($games as $game) {
        if (isset($game['updatedAt']) && $game['updatedAt'] < $updateDelay) {
            $notFoundIds[] = $game['id'];
        }
    }

    // Fetch and insert missing games
    $importedGames = [];
    if (!empty($notFoundIds)) {
        importGames($notFoundIds);
        $importedGames = exportGames($notFoundIds);
    }

    return array_merge($games, $importedGames);
}
