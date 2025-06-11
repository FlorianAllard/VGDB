<?php

require  __DIR__ . '/api.php';
require  __DIR__ . '/router.php';

post('/login', './controller/login.php');

any('/404', './controller/404.php');