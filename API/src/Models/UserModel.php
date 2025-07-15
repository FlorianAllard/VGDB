<?php

namespace Models;

use Abstract\AbstractModel;
use Entities\UserEntity;
use \PDO;

class UserModel extends AbstractModel
{
    protected string $linkedClass = UserEntity::class;

    function getUsers($get): array|false
    {
        $subqueries = [$this->getTitleSubquery(), $this->getCollectionSubquery()];

        $formatedGet = $this->formatGetStatements($get);
        $where = $formatedGet['where'];
        $parameters = $formatedGet['parameters'];
        $columns = implode(', ', [
            'id',
            'email',
            'username',
            'password',
            'createdAt',
            'profilePicturePath',
        ]);

        $sql = $this->prepareQuery(sprintf(
            "SELECT $columns, %s FROM Users $where",
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

    function addUser(UserEntity $user): void
    {
        $data = [
            "email" => $user->getEmail(),
            "username" => $user->getUsername(),
            "title_id" => 6,
            "password" => $user->getPassword(),
            "createdAt" => $user->getCreatedAt(),
            "profilePicturePath" => $user->getProfilePicturePath(),
        ];
        $fields = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $sql = $this->prepareQuery("INSERT INTO Users($fields) VALUES ($placeholders)");
        $sql->execute(array_values($data));
    }

    function getTitleSubquery()
    {
        return <<<SQL
                (SELECT JSON_OBJECT(
                        'id', UserTitles.id,
                        'name', UserTitles.name
                    )
                FROM UserTitles
                WHERE UserTitles.id = Users.title_id
                ) AS title
            SQL;
    }

    function getCollectionSubquery()
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

        $favorites = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Games.id,
                'name', Games.name,
                'covers', $covers
            ))
            FROM Games
            JOIN Favorites ON Favorites.user_id = Users.id
            WHERE Favorites.game_id = Games.id
            )
            SQL;

        $completed = <<<SQL
            (SELECT COUNT(*)
            FROM Games
            JOIN Games_Users ON Games_Users.user_id = Users.id
            WHERE Games_Users.game_id = Games.id AND Games_Users.category_id = 1
            )
            SQL;

        $played = <<<SQL
            (SELECT COUNT(*)
            FROM Games
            JOIN Games_Users ON Games_Users.user_id = Users.id
            WHERE Games_Users.game_id = Games.id AND Games_Users.category_id = 2
            )
            SQL;

        $backlog = <<<SQL
            (SELECT COUNT(*)
            FROM Games
            JOIN Games_Users ON Games_Users.user_id = Users.id
            WHERE Games_Users.game_id = Games.id AND Games_Users.category_id = 3
            )
            SQL;

        $wishlist = <<<SQL
            (SELECT COUNT(*)
            FROM Games
            JOIN Games_Users ON Games_Users.user_id = Users.id
            WHERE Games_Users.game_id = Games.id AND Games_Users.category_id = 4
            )
            SQL;


        return <<<SQL
                (SELECT JSON_OBJECT(
                        'favorites', $favorites,
                        'completed', $completed,
                        'played', $played,
                        'backlog', $backlog,
                        'wishlist', $wishlist
                    )
                ) AS collection
            SQL;
    }
}
