<?php

require  __DIR__ . '/api.php';
require  __DIR__ . '/router.php';

post('/users/$action', './controller/userController.php');

any('/404', './controller/404.php');