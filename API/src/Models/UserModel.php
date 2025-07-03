<?php

namespace Models;

use Abstract\AbstractModel;
use Entities\UserEntity;

class UserModel extends AbstractModel
{
    protected string $linkedClass = UserEntity::class;

    function getUserByEmail(string $email): UserEntity|false
    {
        $subqueries = [$this->getTitleSubquery()];
        $select = $this->getSelect();
        $sql = $this->prepareQuery(sprintf(
            "SELECT $select, %s FROM users WHERE email = :email",
            implode(",\n", $subqueries)
        ));
        $sql->execute([":email" => $email]);
        return $sql->fetch();
    }

    function getUserByID(string $id): UserEntity|false
    {
        $subqueries = [$this->getTitleSubquery()];
        $sql = $this->prepareQuery(sprintf(
            "SELECT *, %s FROM users WHERE id = :id",
            implode(",\n", $subqueries)
        ));
        $sql->execute([":id" => $id]);
        return $sql->fetch();
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

    function getSelect() {
        $array = [
            "id",
            "email",
            "username",
            "password",
            "createdAt",
            "profilePicturePath",
        ];
        return implode(", ", $array);
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
