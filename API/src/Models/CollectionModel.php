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

        $sql = $this->prepareQuery(
            "INSERT INTO Games_Users($fields) 
            VALUES ($placeholders)
            ON DUPLICATE KEY UPDATE `category_id`=VALUES(`category_id`)"
        );
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

        return <<<SQL
        (SELECT JSON_OBJECT(
                'id', Games.id,
                'name', Games.name,
                'covers', $covers
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