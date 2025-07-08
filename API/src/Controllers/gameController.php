<?php

namespace Controllers;

use Abstract\AbstractController;
use Interfaces\CRUDInterface;
use Entities\GameEntity;
use Exception;
use IGDB;
use Models\GameModel;

require_once __DIR__."/../services/_igdb.php";

class GameController extends AbstractController implements CRUDInterface
{
    private GameModel $database;

    public function __construct()
    {
        $this->database = new GameModel();
    }

    public function create($post) 
    {
        
    }

    public function read($get)
    {
        $foundData = $this->database->getGames($get);
        $data = [];

        // If specific games are requested, find those who were not found
        $ids = explode(",", $get['id']);
        if (count($ids) > 0) {
            $foundIds = array_column($data, 'id');
            $notFoundIds = array_diff($ids, $foundIds);

            // If game has not been updated for a time, add to missing list
            $updateDelay = time() - (60 * 60 * 24 * 7);
            foreach ($foundData as $game) {
                if($game['updatedAt'] < $updateDelay) {
                    $notFoundIds[] = $game['id'];
                } else {
                    $foundData[] = $game;
                }
            }

            // Request missing games from IGDB, format and add to database
            if (count($notFoundIds) > 0) {
                $igdb = new IGDB();
                $rawGames = $igdb->requestGames($notFoundIds);
                foreach ($rawGames as $raw) {
                    $entity = $this->database->formatGameFromIGDB($raw);
                    $this->database->addGame($entity);
                    $data[] = $entity->encode();
                }
            }
        }

        echo json_encode(['status' => 200, 'data' => $data]);
    }

    public function update() {}

    public function delete() {}
}
