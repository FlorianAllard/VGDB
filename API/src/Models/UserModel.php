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
        $subqueries = [$this->getTitleSubquery()];

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
}
