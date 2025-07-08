<?php

namespace Models;

use Abstract\AbstractModel;
use Entities\UserEntity;

class UserModel extends AbstractModel
{
    protected string $linkedClass = UserEntity::class;

    function getUsers($get): array|false
    {
        $subqueries = [$this->getTitleSubquery()];

        $formatedGet = $this->formatGetStatements($get);
        $where = $formatedGet['where'];
        $parameters = $formatedGet['parameters'];

        $sql = $this->prepareQuery(sprintf(
            "SELECT *, %s FROM users $where",
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
            "title" => 6,
            "password" => $user->getPassword(),
            "createdAt" => $user->getCreatedAt(),
            "profilePicturePath" => $user->getProfilePicturePath(),
        ];
        $fields = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $sql = $this->prepareQuery("INSERT INTO users($fields) VALUES ($placeholders)");
        $sql->execute(array_values($data));
    }

    function getTitleSubquery()
    {
        return <<<SQL
                (SELECT JSON_OBJECT(
                        'id', user_titles.id,
                        'name', user_titles.name
                    )
                FROM user_titles
                WHERE user_titles.id = users.title
                ) AS title
            SQL;
    }
}
