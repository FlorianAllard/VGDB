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
        $timer = time();
        $comment = "";

        $foundData = $this->database->getGames($get);
        $data = [];

        // If specific games are requested, find those who were not found
        $ids = explode(",", $get['id']);
        if (count($ids) > 0) {
            $foundIds = array_column($foundData, 'id');
            $notFoundIds = array_diff($ids, $foundIds);

            // If game has not been updated for a time, add to missing list
            $updateDelay = time() - (60 * 60 * 24 * 7);
            foreach ($foundData as $game) {
                if($game['updatedAt'] < $updateDelay) {
                    $notFoundIds[] = $game['id'];
                } else {
                    $data[] = $game;
                }
            }
            
            // Request missing games from IGDB, format and add to database
            if (count($notFoundIds) > 0) {
                $igdb = new IGDB();
                $rawGames = $igdb->requestGames($notFoundIds);
                $timesToBeat = $igdb->requestTimesToBeat($notFoundIds);
                foreach ($rawGames as $raw) {
                    $ttb = array_find($timesToBeat, function($value) use ($raw) {
                        return $value['game_id'] == $raw['id'];
                    });
                    $entity = $this->database->formatGameFromIGDB($raw, $ttb);
                    $this->database->addGame($entity);
                }

                $string = implode(", ", $notFoundIds);
                $data = array_merge($data, $this->database->getGames(['id' => $string]));
                $comment = " ($string had to be requested from IGDB)";
            }
        }
        
        $timeString = "Completed in " . round((microtime(true) - $timer), 3) . " seconds$comment";
        echo json_encode(['status' => 200, 'time' => $timeString, 'data' => $data]);
    }

    public function update() {}

    public function delete() {}
}
