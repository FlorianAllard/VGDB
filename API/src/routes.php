<?php

require  __DIR__ . '/api.php';
require  __DIR__ . '/router.php';

//POST
post('/users/$action', './controller/userController.php');
post('/reviews/$action', './controller/reviewController.php');
//GET
get('/games', './controller/gameController.php');
get('/reviews', './controller/reviewController.php');

any('/404', './controller/404.php');