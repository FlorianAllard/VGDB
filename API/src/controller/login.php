<?php

require __DIR__ . "/../model/userRequests.php";

$email = "";
$password = "";
$user;
$error = [];
$errorCode = 400;

//Login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verify email
    if (empty($_POST['email'])) {
        $error['email'] = "Please enter your email.";
        $errorCode = 400;
    } else {
        $email = trim($_POST['email']);
    }

    //Verify password
    if (empty($_POST['password'])) {
        $error['password'] = "Please enter your password.";
        $errorCode = 400;
    } else {
        $password = trim($_POST['password']);
    }

    if (empty($error)) {
        $user = getUser($email);
        if (!$user) {
            $error['user'] = "Incorrect email/password.";
            $errorCode = 401;
        } else if (!password_verify($password, $user['password'])) {
            $error['user'] = "Incorrect email/password.";
            $errorCode = 401;
        }
    }

    if(empty($error)) {
        sendResponse($user, 200);
    } else {
        sendResponse($error, $errorCode);
    }
}
