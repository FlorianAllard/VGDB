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

    public function create($post) {
        $errors = [];
        $user = new ReviewEntity();

        $user->setGame($post['game'] ?? '');
        $user->setUser($post['user'] ?? '');
        $user->setPlatform($post['platform'] ?? '');
        $user->setRating($post['rating'] ?? '');
        $user->setContent($post['content'] ?? '');

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