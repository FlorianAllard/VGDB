<?php

namespace Controllers;

use Abstract\AbstractController;
use Interfaces\CRUDInterface;
use Entities\ReviewEntity;
use Models\ReviewModel;


class ReviewController extends AbstractController implements CRUDInterface
{
    private ReviewModel $database;

    public function __construct()
    {
        $this->database = new ReviewModel();
    }

    public function create() {}
    public function read($get) {}
    public function update() {}
    public function delete() {}
}