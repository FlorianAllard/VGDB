<?php

require __DIR__.'/../services/_pdo.php';

function getUser($email) {
    $pdo = pdoConnection();
    $sql = $pdo -> prepare("SELECT * FROM users WHERE email=?");
    $sql->execute([$email]);
    $user = $sql->fetch();
    return $user;
}