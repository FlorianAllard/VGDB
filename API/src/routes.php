<?php

require  __DIR__ . '/api.php';
require  __DIR__ . '/router.php';
require_once "./Autoloader.php";
Autoloader::register();

use Controllers\CollectionController;
use Controllers\GameController;
use Controllers\UserController;
use Controllers\ReviewController;

try {
    get('/games', function () {
        $class = new GameController();
        $class->read($_GET);
    });

    get('/users', function () {
        $class = new UserController();
        $class->read($_GET);
    });
    get('/users/titles', function () {
        $class = new UserController();
        $class->readTitles($_GET);
    });
    get('/users/pictures', function () {
        $class = new UserController();
        $class->readPictures($_GET);
    });
    post('/users/$action', function ($action) {
        $class = new UserController();
        switch ($action) {
            case "signup":
                $class->create($_POST);
                break;
            case "login":
                $class->login($_POST);
                break;
            case "update":
                $class->update($_POST);
                break;
        }
    });

    get('/collections', function () {
        $class = new CollectionController();
        $class->read($_GET);
    });
    post('/collections/$action', function ($action) {
        $class = new CollectionController();
        switch ($action) {
            case "create":
                $class->create($_POST);
                break;
            case "favorites":
                $class->updateFavorites($_POST);
                break;
        }
    });

    get('/reviews', function () {
        $class = new ReviewController();
        $class->read($_GET);
    });
    post('/reviews/$action', function ($action) {
        $class = new ReviewController();
        switch ($action) {
            case "publish":
                $class->create($_POST);
                break;
        }
    });

    // ANY
    any('/404', './Controllers/404.php');
} catch (\Throwable $th) {
    echo(json_encode("BACKEND ERROR: " . $th->getMessage() . " on line " . $th->getLine() . " in " . $th->getFile()));
}
