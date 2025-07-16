<?php

namespace Controllers;
use Abstract\AbstractController;
use Entities\CollectionEntity;
use Interfaces\CRUDInterface;
use Models\CollectionModel;

class CollectionController extends AbstractController implements CRUDInterface {
    private CollectionModel $database;

    public function __construct() {
        $this-> database = new CollectionModel();
    }

    public function create(array $post) {
        $errors = [];
        $collection = new CollectionEntity();

        if ($post['category_id'] > -1) {
            $collection->setGame($post['game_id'] ?? '');
            $collection->setUser($post['user_id'] ?? '');
            $collection->setCategory($post['category_id'] ?? '');

            $errors = $collection->validate();

            if (empty($errors)) {
                $this->database->addCollections($collection);
                echo json_encode(['status' => 200, 'data' => $collection]);
            }
        } else {
            $this->database->removeCollections($post);
            echo json_encode(['status' => 200, 'message' => "Deleted successfully"]);
        }

        echo ['status' => 405, 'data' => $errors];
    }

    public function read(array $get) {
        $data = $this->database->getCollections($get);
        echo json_encode(['status' => 200, 'data' => $data]);
    }

    public function update($post) {}

    public function delete() {}
}