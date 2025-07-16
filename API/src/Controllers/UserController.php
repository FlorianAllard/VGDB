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

    public function create($post) {
        $errors = [];
        $user = new UserEntity();

        $user->setEmail($post['email'] ?? '');
        $user->setUsername($post['username'] ?? '');
        $user->setPassword($post['password'] ?? '');
        $user->setPasswordConfirm($post['passwordConfirm'] ?? '');

        $errors = $user->validate();

        $userWithSameEmail = $this->database->getUsers(['email' => $user->getEmail()]);
        if ($userWithSameEmail) {
            $errors['email'] = "This email address is already in use";
        }

        if (empty($errors)) {
            $this->database->addUser($user);
            $data = $this->database->getUsers(['email' => $user->getEmail()]);
            echo json_encode(['status' => 200, 'data' => $data]);
            return;
        } 

        echo json_encode(['status' => 405, 'data' => $errors]);
    }

    public function login($post) {
        $errors = [];
        $user = new UserEntity();

        $user->setEmail($post['email'] ?? '');
        $user->setPassword($post['password'] ?? '', false);

        if (empty($user->getEmail())) {
            $errors['email'] = "Please enter your email address";
        }
        if (empty($user->getPassword())) {
            $errors['password'] = "Please enter your password";
        }

        if(empty($errors)) {
            $data = $this->database->getUsers(['email' => $user->getEmail()]);
            if($data && password_verify($user->getPassword(), $data[0]['password'])) {
                echo json_encode(['status' => 200, 'data' => $data]);
                return;
            } else {
                $errors['login'] = "Incorrect email and/or password";
            }
        }

       echo json_encode(['status' => 405, 'data' => $errors]);
    }

    public function read($get) {
        $data = $this->database->getUsers($get);
        echo json_encode(['status' => 200, 'data' => $data]);
    }

    public function readTitles($get) {
        $data = $this->database->getTitles($get);
        echo json_encode(['status' => 200, 'data' => $data]);
    }

    public function update($post) {
        $this->database->updateUser($post);
        $data = $this->database->getUsers(['id' => $post['id']]);
        echo json_encode(['status' => 200, 'data' => $data]);
    }

    public function delete() {

    }
}