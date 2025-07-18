<?php

namespace Entities;
use Abstract\AbstractEntity;

class UserEntity extends AbstractEntity {
    private int $id = 0;
    private string $email = "";
    private string $username = "";
    private string $title;
    private string $password = "";
    private ?string $passwordConfirm = NULL;
    private ?string $passwordPlain = NULL;
    private int $createdAt;
    private string $picture = "";
    private string $collection = "";

    private const PASSWORD_REGEX = "/^(?=.*[!?@#$%^&*+-])(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{6,}$/";

    public function __construct() {
        $this->createdAt = time();
    }

    public function format(): array {
        return [];
    }

    public function encode(): array {
        $profile = json_decode($this->picture, true);
        $profile['path'] = str_replace('\\', '/', $profile['path']);
        $profile['path'] = str_replace('//', '/', $profile['path']);
        $profile['path'] = preg_replace('#^.*(/Assets)#', '$1', $profile['path']);

        return [
            "id" => $this->id,
            "email" => $this->email,
            "username" => $this->username,
            "title" => json_decode($this->title),
            "password" => $this->password,
            "createdAt" => $this->createdAt,
            "picture" => $profile,
            "collection" => json_decode($this->collection),
        ];
    }

    public function validate(): array {
        $errors = [];

        // Email
        if (empty($this->email)) {
            $errors['email'] = "Please enter your email address";
        } else if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = "Invalid email address";
        }

        // Username
        if (empty($this->username)) {
            $errors['username'] = "Please enter your username";
        } else if (!preg_match("/^[A-Za-z0-9_-]+$/", $this->username)) {
            $errors['username'] = "Invalid characters";
        } else if (strlen($this->username) < 3 || strlen($this->username) > 20) {
            $errors['username'] = "Must be 3 to 20 characters long";
        }

        // Password
        if (empty($this->password) || empty($this->passwordPlain)) {
            $errors['password'] = "Please enter your password";
        } else if (!preg_match(self::PASSWORD_REGEX, $this->passwordPlain) || strlen($this->passwordPlain) < 8) {
            $errors['password'] = "Please use a more complex password";
        }

        if (empty($this->passwordConfirm)) {
            $errors['passwordConfirm'] = "Please confirm your password";
        } else if (!password_verify($this->passwordConfirm, $this->password)) {
            $errors['password'] = "Passwords do not match ";
        }

        return $errors;
    }

    // Get/Set id
    public function getID(): int { return $this->id; }
    public function setID(int $newID) { $this->id = $newID; }

    // Get/Set email
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $newEmail) { 
        $newEmail = $this->cleanString($newEmail);
        $this->email = $newEmail;
    }

    // Get/Set username
    public function getUsername(): string { return $this->username; }
    public function setUsername(string $newUsername) {
        $newUsername = $this->cleanString($newUsername);
        $this->username = $newUsername;
    }

    // Get/Set title
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $newTitle) { $this->title = $newTitle; }

    // Get/Set password
    public function getPassword(): string { return $this->password; }
    public function setPassword(string $newPassword, bool $hash = true) {
        $newPassword = trim($newPassword);
        $this->passwordPlain = $newPassword;
        if($hash) $this->password = password_hash($newPassword, PASSWORD_DEFAULT);
        else $this->password = $newPassword;
    }

    
    // Get/Set password confirm
    public function getPasswordConfirm(): string { return $this->passwordConfirm; }
    public function setPasswordConfirm(string $newConfirm) {
        $newConfirm = trim($newConfirm);
        $this->passwordConfirm = $newConfirm;
    }

    // Get/Set createdAt
    public function getCreatedAt(): int { return $this->createdAt; }
    public function setCreatedAt(int $newCreatedAt) { $this->createdAt = $newCreatedAt; }

    
    // Get/Set username
    public function getPicture(): string { return $this->picture; }
    public function setPicture(string $newPicture) { $this->picture = $newPicture; }
}