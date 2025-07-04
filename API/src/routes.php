<?php

require  __DIR__ . '/api.php';
require  __DIR__ . '/router.php';
require_once "./Autoloader.php";
Autoloader::register();

use Controllers\UserController;

try {
    post('/users/$action', function ($action) {
        $class = new UserController();
        switch ($action) {
            case "signup":
                $class->create();
                break;
        }
    });

    get('/users', function () {
        $class = new UserController();
        $class->read($_GET);
    });

    post('/reviews/$action', './Controllers/reviewController.php');

    //GET
    get('/games', './Controllers/gameController.php');
    get('/reviews', './Controllers/reviewController.php');

    // ANY
    any('/404', './Controllers/404.php');
} catch (\Throwable $th) {
    echo(json_encode("BACKEND ERROR: " . $th->getMessage() . " on line " . $th->getLine() . " in " . $th->getFile()));
}
