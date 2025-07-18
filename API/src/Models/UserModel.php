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
        $subqueries = [
            $this->getTitleSubquery(),
            $this->getPictureSubquery(),
            $this->getCollectionSubquery(),
        ];

        $formatedGet = $this->formatGetStatements($get);
        $where = $formatedGet['where'];
        $parameters = $formatedGet['parameters'];
        $columns = implode(', ', [
            'id',
            'email',
            'username',
            'password',
            'createdAt',
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

    function getTitles($get): array|false {
        $formatedGet = $this->formatGetStatements($get);
        $where = $formatedGet['where'];
        $parameters = $formatedGet['parameters'];

        $sql = $this->prepareQuery("SELECT * FROM UserTitles $where");
        $sql->execute($parameters);

        $data = $sql->fetchAll(PDO::FETCH_ASSOC);
        return $data;
    }

    function getPictures($get): array|false {
        $formatedGet = $this->formatGetStatements($get);
        $where = $formatedGet['where'];
        $parameters = $formatedGet['parameters'];

        $sql = $this->prepareQuery("SELECT * FROM ProfilePictures $where");
        $sql->execute($parameters);

        $data = $sql->fetchAll(PDO::FETCH_ASSOC);
        foreach ($data as &$dt) {
            $dt['path'] = str_replace('\\', '/', $dt['path']);
            $dt['path'] = str_replace('//', '/', $dt['path']);
            $dt['path'] = preg_replace('#^.*(/Assets)#', '$1', $dt['path']);
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
            "picture_id" => 1,
        ];
        $fields = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $sql = $this->prepareQuery("INSERT INTO Users($fields) VALUES ($placeholders)");
        $sql->execute(array_values($data));
    }

    function updateUser(array $post): void
    {
        $where = "id = " . $post['id'];
        $fields = [];
        foreach ($post as $key => $value) {
            if($key != 'id') {
                $fields[] = "$key = $value";
            }
        }
        $fields = implode(", ", $fields);

        $sql = $this->prepareQuery("UPDATE Users SET $fields WHERE $where");
        $sql->execute();
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

    function getPictureSubquery()
    {
        return <<<SQL
                (SELECT JSON_OBJECT(
                        'id', ProfilePictures.id,
                        'path', ProfilePictures.path
                    )
                FROM ProfilePictures
                WHERE ProfilePictures.id = Users.picture_id
                ) AS picture
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
