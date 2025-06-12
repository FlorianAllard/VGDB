<?php

header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Content-Type: application/json");

require __DIR__ . "/../model/userModel.php";

switch ($_SERVER["REQUEST_METHOD"]) {
    case "POST":
        if ($action === "login") {
            login();
        }
        break;
        // ...other cases...
}

function login() {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $error = [];
    $status = 400;

    if (empty($email)) {
        $error['email'] = "Please enter your email.";
    }
    if (empty($password)) {
        $error['password'] = "Please enter your password.";
    }

    if (empty($error)) {
        $user = getUser($email);
        if (!$user || !password_verify($password, $user['password'])) {
            $error['email'] = "Incorrect email/password.";
            $status = 401;
        } else {
            // Success: return user data (remove password field)
            unset($user['password']);
            echo json_encode(['status' => 200, 'data' => $user]);
            return;
        }
    }

    echo json_encode(['status' => $status, 'data' => $error]);
}
