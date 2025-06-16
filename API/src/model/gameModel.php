<?php

require_once __DIR__.'/../services/_debug.php';
require __DIR__.'/../services/_pdo.php';
require __DIR__.'/../services/_igdb.php';

function getGames($ids) {
    $pdo = pdoConnection();
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $sql = $pdo -> prepare("SELECT * FROM games WHERE id IN ($placeholders)");
    $sql -> execute($ids);
    $games = $sql->fetchAll();
    
    $notFoundIds = array_diff($ids, array_column($games, 'id'));
    $notFoundGames = [];
    if(!empty($notFoundIds)) {
        $notFoundGames = createGames($pdo, $notFoundIds);
    }
    
    return array_merge($games, $notFoundGames);
}

function createGames($pdo, $ids) {
    $return = [];

    $games = requestGames($ids);
    foreach ($games as $rawGame) {
        $game = formatGame($rawGame);
        $gameData = $game;

        unset($gameData['genres']);
        insertInto("games", $gameData, $pdo);

        $genres = $game['genres'];
        foreach ($genres as $rawGenre) {
            $genre = formatGenre($rawGenre);
            $game_to_genre = [];
            $game_to_genre['game_id'] = $game['id'];
            $game_to_genre['genre_id'] = $genre['id'];
            insertInto("genres", $genre, $pdo);
            insertInto("games_to_genres", $game_to_genre, $pdo);
        }
    }


    return $return;
}

function formatGame($raw)
{
    $game = [];
    $game['id'] = $raw['id'];
    $game['name'] = $raw['name'];
    $game['official_release_date'] = $raw['first_release_date'] ?? -1;
    $game['summary'] = $raw['summary'] ?? "";
    $game['premise'] = $raw['storyline'] ?? "";
    $game['genres'] = $raw['genres'] ?? [];
    $games[] = $game;

    return $game;
}

function formatGenre($raw) {
    $genre = [];
    $genre['id'] = $raw['id'];
    $genre['name'] = $raw['name'];

    return $genre;
}

function insertInto($table, $object, $pdo)
{
    if (empty($object)) return;

    $columns = array_keys($object);
    $placeholders = '(' . implode(',', array_fill(0, count($columns), '?')) . ')';

    $sql = "INSERT INTO $table (" . implode(',', $columns) . ") VALUES $placeholders  ON DUPLICATE KEY UPDATE id=id";
    $stmt = $pdo -> prepare($sql);
    $values = array_values($object);

    $stmt -> execute($values);
}
