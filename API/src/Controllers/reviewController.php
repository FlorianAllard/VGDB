<?php

namespace Controllers;

use Abstract\AbstractController;
use Interfaces\CRUDInterface;
use Entities\ReviewEntity;
use Models\ReviewModel;


class ReviewController extends AbstractController implements CRUDInterface
{
    private ReviewModel $database;

    public function __construct() {
        $this->database = new ReviewModel();
    }

    public function create() {
        $errors = [];
        $user = new ReviewEntity();

        $user->setGame($_POST['game'] ?? '');
        $user->setUser($_POST['user'] ?? '');
        $user->setPlatform($_POST['platform'] ?? '');
        $user->setRating($_POST['rating'] ?? '');
        $user->setContent($_POST['content'] ?? '');

        $errors = $user->validate();

        // $reviewFromSameUser = $this->database->getReviews()
    }

    public function read($get) {
        $data = $this->database->getReviews($get);
        echo json_encode(['status' => 200, 'data' => $data]);
    }

    public function update() {}

    public function delete() {}
}