<?php

namespace Models;

use Abstract\AbstractModel;
use Entities\ReviewEntity;
use Exception;

class ReviewModel extends AbstractModel {
    protected string $linkedClass = ReviewEntity::class;

    function getReviews($get): array|false {
        $subqueries = [$this->getGameSubquery(), $this->getUserSubquery(), $this->getPlatformSubquery()];

        
        $formatedGet = $this->formatGetStatements($get);
        $where = $formatedGet['where'];
        $parameters = $formatedGet['parameters'];
        
        $sql = $this->prepareQuery(sprintf(
            "SELECT *, %s FROM Reviews $where",
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
        $coverQuery = <<<SQL
            (SELECT JSON_OBJECT(
                'hero', covers.hero,
                'landscape', covers.landscape,
                'portrait', covers.portrait,
                'logo', covers.logo)
            FROM covers
            WHERE covers.game_id = games.id)
            SQL;

        return <<<SQL
            (SELECT JSON_OBJECT(
                'id', games.id,
                'name', games.name,
                'cover', $coverQuery)
            FROM games
            WHERE games.id = reviews.game)
            AS game
            SQL;
    }

    function getUserSubquery() {
        $titleQuery = <<<SQL
            (SELECT JSON_OBJECT(
                'id', user_titles.id,
                'name', user_titles.name)
            FROM user_titles
            WHERE user_titles.id = users.title)
            SQL;

        return <<<SQL
            (SELECT JSON_OBJECT(
                'id', users.id,
                'username', users.username,
                'title', $titleQuery,
                'profilePicturePath', users.profilePicturePath)
            FROM users
            WHERE users.id = reviews.user)
            AS user
            SQL;
    }

    function getPlatformSubquery() {
        $familyQuery = <<<SQL
            (SELECT JSON_OBJECT(
                'id', platform_families.id,
                'name', platform_families.name)
            FROM platform_families
            WHERE platform_families.id = platforms.family)
            SQL;

        return <<<SQL
            (SELECT JSON_OBJECT(
                'id', platforms.id,
                'name', platforms.name,
                'family', $familyQuery,
                'generation', platforms.generation)
            FROM platforms
            WHERE platforms.id = reviews.platform)
            AS platform
            SQL;
    }
}