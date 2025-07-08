<?php

namespace Controllers;

use Abstract\AbstractController;
use Interfaces\CRUDInterface;
use Entities\GameEntity;
use Models\GameModel;

class GameController extends AbstractController implements CRUDInterface
{
    private GameModel $database;

    public function __construct()
    {
        $this->database = new GameModel();
    }

    public function create() { }

    public function read($get)
    {
        $data = $this->database->getGames($get);
        echo json_encode(['status' => 200, 'data' => $data]);
    }

    public function update() {}

    public function delete() {}
}
