<?php

header("Access-Control-Allow-Methods: POST");

require __DIR__ . "/../model/userModel.php";
require __DIR__ . "/../services/_csrf.php";

switch ($_SERVER["REQUEST_METHOD"]) {
    case "POST":
        if ($action === "login") {
            login();
        } else if ($action === "signup") {
            signup();
        }
        break;
        // ...other cases...
}

function login() {
    $user = null;
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $error = [];
    $status = 400;

    // Email verification
    if (empty($email)) {
        $error['email'] = "Please enter your email.";
    } else {
        $user = getUser($email);
        if(!$user) {
            $error['both'] = "Incorrect email/password.";
        }
    }

    // Password verification
    if (empty($password)) {
        $error['password'] = "Please enter your password.";
    } else if ($user && !password_verify($password, $user['password'])) {
        $error['both'] = "Incorrect email/password.";
        $status = 401;
    }

    // Success
    if (empty($error)) {
        unset($user['password']);
        echo json_encode(['status' => 200, 'data' => $user]);
        return;
    }

    echo json_encode(['status' => $status, 'data' => $error]);
}

function signup() {
    $user = null;
    $username = sanitize($_POST['username']) ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $passwordConfirm = $_POST['password_confirm'] ?? '';
    $profilePic = $_POST['profile_picture'] ?? '';
    $error = [];
    $status = 400;

    // Username verification
    if (empty($username)) {
        $error["username"] = "Please enter a username.";
    } else {
        if (strlen($username) < 3 || strlen($username) > 20) {
            $error["username"] = "Must be 3 to 20 characters long.";
        }
        if (!preg_match("/^[A-Za-z0-9_-]+$/", $username)) {
            $error["username"] = "Invalid characters.";
        }
    }

    // Email verification
    if (empty($email)) {
        $error['email'] = "Please enter your email.";
    } else {
        $user = getUser($email);
        if($user) {
            $error['email'] = "Email address already in use.";
        }
    }

    // Password verification
    if (empty($password)) {
        $error['password'] = "Please enter your password.";
    } else  if (!preg_match("/^(?=.*[!?@#$%^&*+-])(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{6,}$/", $password) || strlen($password) < 8) {
        $error["password"] = "Use a more complex password.";
    } else {
        $password = password_hash($password, PASSWORD_DEFAULT);
    }

    if (empty($passwordConfirm)) {
        $error["passwordConfirm"] = "Please confirm your password.";
    } else if (!password_verify($passwordConfirm, $password)) {
        $error["passwordConfirm"] = "Passwords must be identical.";
    }

    // Success
    if(empty($error)) {
        $pdo = pdoConnection();
        $sql = $pdo->prepare("INSERT INTO users(username, email, password, profilePic) VALUES(:username, :email, :password, :profile_picture)");
        $sql->execute([
            'username' => $username,
            'email' => $email,
            'password' => $password,
            'profile_picture' => $profilePic
        ]);

        $user = getUser($email);
        unset($user['password']);
        echo json_encode(['status' => 200, 'data' => $user]);
        return;
    }

    echo json_encode(['status' => $status, 'data' => $error]);
}
