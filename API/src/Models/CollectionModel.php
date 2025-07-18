<?php

namespace Models;

use Abstract\AbstractModel;
use Entities\CollectionEntity;

class CollectionModel extends AbstractModel
{
    protected string $linkedClass = CollectionEntity::class;

    function addCollections(CollectionEntity $collection): void
    {
        $data = [
            "game_id" => $collection->getGame(),
            "user_id" => $collection->getUser(),
            "category_id" => $collection->getCategory(),
        ];

        $fields = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));

        if($data['category_id'] == 0) {
            $sql = $this->prepareQuery(
                "INSERT INTO Favorites($fields) 
                VALUES ($placeholders)"
            );
        } else {
            $sql = $this->prepareQuery(
                "INSERT INTO Games_Users($fields) 
                VALUES ($placeholders)
                ON DUPLICATE KEY UPDATE `category_id`=VALUES(`category_id`)"
            );
        }
       
        $sql->execute((array_values($data)));
    }

    function removeCollections($delete): void {
        $gameWhere = isset($delete['game_id']) ? "game_id=" . $delete['game_id'] : "";
        $userWhere = isset($delete['user_id']) ? "user_id=" . $delete['user_id'] : "";
        if($userWhere && $gameWhere) {
            $gameWhere .= " AND";
        }

        $sql = $this->prepareQuery(
            "DELETE FROM Games_Users 
            WHERE $gameWhere $userWhere"
        );
        $sql->execute();

        $sql = $this->prepareQuery(
            "DELETE FROM Favorites 
            WHERE $gameWhere $userWhere"
        );
        $sql->execute();
    }

    function getCollections($get): array|false
    {
        $subqueries = [
            $this->getGameSubquery(),
            $this->getUserSubquery(),
            $this->getCategorySubquery(),
        ];

        $formatedGet = $this->formatGetStatements($get);
        $where = $formatedGet['where'];
        $parameters = $formatedGet['parameters'];

        $sql = $this->prepareQuery(sprintf(
            "SELECT %s FROM Games_Users $where",
            implode(",\n", $subqueries)
        ));
        $sql->execute($parameters);

        $data = [];
        $entities = $sql->fetchAll();
        foreach ($entities as $entity) {
            $data[] = $entity->encode();
        }

        return $data;
    }

    function updateFavorites($post): void {
        $user = $post['user_id'];
        $data = [
            'user_id' => [],
            'game_id' => [],
        ];
        $gameIDs = explode(",", $post['game_id']);
        foreach ($gameIDs as $game) {
            $data['user_id'][] = $user;
            $data['game_id'][] = $game;
        }
        $sql = $this->prepareQuery("DELETE FROM Favorites WHERE user_id=$user");
        $sql->execute();

        $this->insertInto('Favorites', $data, true);
    }

    function getGameSubquery()
    {   
        $covers = <<<SQL
            (SELECT JSON_OBJECT(
                'id', Covers.id,
                'hero', Covers.hero,
                'landscape', Covers.landscape,
                'portrait', Covers.portrait,
                'logo', Covers.logo)
            FROM Covers
            WHERE Covers.game_id = Games.id)
            SQL;

        $genres = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Genres.id,
                'name', Genres.name))
            FROM Genres
            JOIN Games_Genres ON Games_Genres.game_id = Games.id
            WHERE Genres.id = Games_Genres.genre_id)
            SQL;

        return <<<SQL
        (SELECT JSON_OBJECT(
                'id', Games.id,
                'name', Games.name,
                'covers', $covers,
                'genres', $genres
            )
        FROM Games
        WHERE Games.id = Games_Users.game_id
        ) AS game
        SQL;
    }

    function getUserSubquery()
    {
        return <<<SQL
        (SELECT JSON_OBJECT(
                'id', Users.id,
                'name', Users.username
            )
        FROM Users
        WHERE Users.id = Games_Users.user_id
        ) AS user
        SQL;
    }

    function getCategorySubquery()
    {
        return <<<SQL
        (SELECT JSON_OBJECT(
                'id', CollectionCategories.id,
                'name', CollectionCategories.name
            )
        FROM CollectionCategories
        WHERE CollectionCategories.id = Games_Users.category_id
        ) AS category
        SQL;
    }
}