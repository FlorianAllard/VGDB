<?php

header("Access-Control-Allow-Methods: GET");

require_once __DIR__ . '/../services/_debug.php';
require_once __DIR__ . "/../services/_csrf.php";
require_once __DIR__ . "/../model/gameModel.php";

switch ($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        getGames();
        break;
        // ...other cases...
}

function getGames() {
    $startTime = time();
    $error = [];
    $status = 400;

    $games = fetchGames($_GET);

    $time = round((microtime(true) - $startTime), 3);
    echo json_encode([
        'status' => 200,
        'time' => $time . " s",
        'data' => $games]);
}
