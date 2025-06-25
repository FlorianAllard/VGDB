<?php

header("Access-Control-Allow-Methods: GET");

require_once __DIR__ . '/../services/_debug.php';
require __DIR__ . "/../services/_csrf.php";
require __DIR__ . "/../model/gameModel.php";

switch ($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        games(explode('%2C', $ids));
        break;
        // ...other cases...
}

function games(array $array) {
    $startTime = time();
    $games = getGames($array);
    $time = round((microtime(true) - $startTime), 3);
    echo json_encode([
        'status' => 200,
        'time' => $time . " s",
        'data' => $games]);
}
