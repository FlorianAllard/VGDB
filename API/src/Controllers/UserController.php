<?php

namespace Controllers;
use Abstract\AbstractController;
use Interfaces\CRUDInterface;
use Entities\UserEntity;
use Exception;
use Models\UserModel;

class UserController extends AbstractController implements CRUDInterface {
    private UserModel $database;

    public function __construct() {
        $this-> database = new UserModel();
    }

    public function create() {
        $errors = [];
        $user = new UserEntity();

        $user->setEmail($_POST['email'] ?? '');
        $user->setUsername($_POST['username'] ?? '');
        $user->setPassword($_POST['password'] ?? '');
        $user->setPasswordConfirm($_POST['passwordConfirm'] ?? '');

        $errors = $user->validate();

        $userWithSameEmail = $this->database->getUserByEmail($user->getEmail());
        if ($userWithSameEmail) {
            $errors['email'] = "This email address is already in use";
        }

        if (empty($errors)) {
            $this->database->addUser($user);
            $user = $this->database->getUserByEmail($user->getEmail());
            echo json_encode(['status' => 200, 'data' => $user->stringify()]);
        } else {
            echo json_encode(['status' => 405, 'data' => $errors]);
        }
    }

    public function read($id) {
        $user = $this->database->getUserByID($id);
        echo json_encode(['status' => 200, 'data' => $user->stringify()]);
    }

    public function update() {

    }

    public function delete() {

    }
}