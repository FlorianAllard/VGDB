<?php

require  __DIR__ . '/api.php';
require  __DIR__ . '/router.php';
require_once "./Autoloader.php";
Autoloader::register();

use Controllers\GameController;
use Controllers\UserController;
use Controllers\ReviewController;

try {
    post('/users/$action', function ($action) {
        $class = new UserController();
        switch ($action) {
            case "signup":
                $class->create($_POST);
                break;
            case "login":
                $class->login($_POST);
                break;
        }
    });

    post('/reviews/$action', function ($action) {
        $class = new ReviewController();
        switch ($action) {
            case "publish":
                $class->create($_POST);
                break;
        }
    });

    get('/users', function () {
        $class = new UserController();
        $class->read($_GET);
    });

    get('/reviews', function () {
        $class = new ReviewController();
        $class->read($_GET);
    });

    get('/games', function () {
        $class = new GameController();
        $class->read($_GET);
    });

    // ANY
    any('/404', './Controllers/404.php');
} catch (\Throwable $th) {
    echo(json_encode("BACKEND ERROR: " . $th->getMessage() . " on line " . $th->getLine() . " in " . $th->getFile()));
}
