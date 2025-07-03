<?php

function sanitize(string $data): string
{
    $data = trim($data);
    $data = stripslashes($data);
    return htmlspecialchars($data);
}

function setCSRF(int $time = 0): void
{
    if ($time > 0) {
        $_SESSION["tokenExpire"] = time() + 60 * $time;
    }
        
    $_SESSION["token"] = bin2hex(random_bytes(50));
}

function isCSRFValid(): bool
{
    if (!isset($_SESSION["tokenExpire"]) || $_SESSION["tokenExpire"] > time()) {
        if (isset($_SESSION['token'], $_POST['token']) && $_SESSION['token'] == $_POST['token']) {
            return true;
        }      
    }

    if (isset($_SERVER['SERVER_PROTOCOL'])) {
        header($_SERVER['SERVER_PROTOCOL'] . ' 405 Method Not Allowed');
    }
    
    return false;
}