<?php

namespace Models;

use Abstract\AbstractModel;
use Entities\GameEntity;

class GameModel extends AbstractModel {
    protected string $linkedClass = GameEntity::class;

    function getGames($get): array|false
    {
        $subqueries = [
            $this->getGenresSubquery(),
            $this->getPlatformsSubquery(),
            $this->getModesSubquery(),
            $this->getPerspectivesSubquery(),
            $this->getThemesSubquery(),
            $this->getCompaniesSubquery(),
            $this->getEnginesSubquery(),
            $this->getSeriesSubquery(),
            $this->getFranchisesSubquery(),
            $this->getLanguagesSubquery(),
            $this->getAgeRatingsSubquery(),
            $this->getRegionalReleasesSubquery(),
            $this->getMediaSubquery(),
            $this->getWebsitesSubquery(),
            $this->getTimesToBeatSubquery(),
        ];

        $formatedGet = $this->formatGetStatements($get);
        $where = $formatedGet['where'];
        $parameters = $formatedGet['parameters'];

        $sql = $this->prepareQuery(sprintf(
            "SELECT *, %s FROM games $where",
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

    function getGenresSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', genres.id,
                'name', genres.name))
            FROM genres
            JOIN games_to_genres ON games_to_genres.game_id = games.id
            WHERE genres.id = games_to_genres.genre_id)
            AS genres
            SQL;
    }

    function getPlatformsSubquery()
    {
        $family = <<<SQL
            (SELECT JSON_OBJECT(
                'id', platform_families.id,
                'name', platform_families.name)
            FROM platform_families
            WHERE platform_families.id = platforms.family)
            SQL;

        return <<<SQL
            (SELECT  JSON_ARRAYAGG(JSON_OBJECT(
                'id', platforms.id,
                'name', platforms.name,
                'family', $family,
                'generation', platforms.generation))
            FROM platforms
            JOIN games_to_platforms ON games_to_platforms.game_id = games.id
            WHERE platforms.id = games_to_platforms.platform_id)
            AS platforms
            SQL;
    }

    function getModesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', modes.id,
                'name', modes.name))
            FROM modes
            JOIN games_to_modes ON games_to_modes.game_id = games.id
            WHERE modes.id = games_to_modes.mode_id)
            AS modes
            SQL;
    }

    function getPerspectivesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', perspectives.id,
                'name', perspectives.name))
            FROM perspectives
            JOIN games_to_perspectives ON games_to_perspectives.game_id = games.id
            WHERE perspectives.id = games_to_perspectives.perspective_id)
            AS perspectives
            SQL;
    }

    function getThemesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', themes.id,
                'name', themes.name))
            FROM themes
            JOIN games_to_themes ON games_to_themes.game_id = games.id
            WHERE themes.id = games_to_themes.theme_id)
            AS themes
            SQL;
    }

    function getCompaniesSubquery()
    {
        $developers = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', companies.id,
                'name', companies.name))
            FROM companies
            JOIN games_to_developers ON games_to_developers.game_id = games.id
            WHERE companies.id = games_to_developers.company_id)
            SQL;

        $supporting = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', companies.id,
                'name', companies.name))
            FROM companies
            JOIN games_to_supporting ON games_to_supporting.game_id = games.id
            WHERE companies.id = games_to_supporting.company_id)
            SQL;

        $publishers = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', companies.id,
                'name', companies.name))
            FROM companies
            JOIN games_to_publishers ON games_to_publishers.game_id = games.id
            WHERE companies.id = games_to_publishers.company_id)
            SQL;

        return <<<SQL
            (SELECT JSON_OBJECT(
                'mainDevelopers', $developers,
                'supportingDevelopers', $supporting,
                'publishers', $publishers))
            AS involvedCompanies
            SQL;
    }

    function getEnginesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', engines.id,
                'name', engines.name))
            FROM engines
            JOIN games_to_engines ON games_to_engines.game_id = games.id
            WHERE engines.id = games_to_engines.engine_id)
            AS engines
            SQL;
    }

    function getSeriesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', series.id,
                'name', series.name))
            FROM series
            JOIN games_to_series ON games_to_series.game_id = games.id
            WHERE series.id = games_to_series.series_id)
            AS series
            SQL;
    }

    function getFranchisesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', franchises.id,
                'name', franchises.name))
            FROM franchises
            JOIN games_to_franchises ON games_to_franchises.game_id = games.id
            WHERE franchises.id = games_to_franchises.franchise_id)
            AS franchises
            SQL;
    }

    function getLanguagesSubquery()
    {
        $audio = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', languages.id,
                'name', languages.name))
            FROM languages
            JOIN games_to_audio ON games_to_audio.game_id = games.id
            WHERE languages.id = games_to_audio.language_id)
            SQL;

        $subtitles = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', languages.id,
                'name', languages.name))
            FROM languages
            JOIN games_to_subtitles ON games_to_subtitles.game_id = games.id
            WHERE languages.id = games_to_subtitles.language_id)
            SQL;

        $interface = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', languages.id,
                'name', languages.name))
            FROM languages
            JOIN games_to_interfaces ON games_to_interfaces.game_id = games.id
            WHERE languages.id = games_to_interfaces.language_id)
            SQL;

        return <<<SQL
            (SELECT JSON_OBJECT(
                'audio', $audio,
                'subtitles', $subtitles,
                'interface', $interface))
            AS supportedLanguages
            SQL;
    }

    function getAgeRatingsSubquery()
    {
        $system = <<<SQL
            (SELECT JSON_OBJECT(
                'id', age_rating_systems.id,
                'name', age_rating_systems.name,
                'country', age_rating_systems.country)
            FROM age_rating_systems
            WHERE age_rating_systems.id = age_ratings.system)
            SQL;

        $contents = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', age_rating_contents.id,
                'description', age_rating_contents.description))
            FROM age_rating_contents
            JOIN age_ratings_to_contents ON age_ratings_to_contents.content = age_rating_contents.id
            WHERE age_ratings_to_contents.rating = age_ratings.id)
            SQL;

        return <<<SQL
            (SELECT  JSON_ARRAYAGG(JSON_OBJECT(
                'id', age_ratings.id,
                'rating', age_ratings.rating,
                'system', $system,
                'contents', $contents))
            FROM age_ratings
            WHERE age_ratings.game = games.id)
            AS ageRatings
            SQL;
    }

    function getRegionalReleasesSubquery()
    {
        $families = <<<SQL
            (SELECT JSON_OBJECT(
                'id', platform_families.id,
                'name', platform_families.name)
            FROM platform_families
            WHERE platform_families.id = platforms.family)
            SQL;

        $platforms = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', platforms.id,
                'name', platforms.name,
                'family', $families,
                'generation', platforms.generation))
            FROM platforms
            JOIN regional_releases_to_platforms ON regional_releases_to_platforms.platform = platforms.id
            WHERE regional_releases_to_platforms.release = regional_releases.id)
            SQL;

        $regions = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', regions.id,
                'name', regions.name))
            FROM regions
            JOIN regional_releases_to_regions ON regional_releases_to_regions.region = regions.id
            WHERE regional_releases_to_regions.release = regional_releases.id)
            SQL;

        $type = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', release_types.id,
                'name', release_types.name))
            FROM release_types
            WHERE release_types.id = regional_releases.type)
            SQL;

        return <<<SQL
            (SELECT  JSON_ARRAYAGG(JSON_OBJECT(
                'id', regional_releases.id,
                'date', regional_releases.date,
                'platforms', $platforms,
                'regions', $regions,
                'type', $type))
            FROM regional_releases
            WHERE regional_releases.game = games.id)
            AS regionalReleases
            SQL;
    }

    function getMediaSubquery()
    {
        $artworks = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', artworks.id,
                'url', artworks.url))
            FROM artworks
            JOIN games_to_artworks ON games_to_artworks.artwork = artworks.id
            WHERE games_to_artworks.game = games.id)
            SQL;

        $screenshots = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', screenshots.id,
                'url', screenshots.url))
            FROM screenshots
            JOIN games_to_screenshots ON games_to_screenshots.screenshot = screenshots.id
            WHERE games_to_screenshots.game = games.id)
            SQL;

        $videos = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', videos.id,
                'name', videos.name,
                'thumbnail', videos.thumbnail,
                'url', videos.url))
            FROM videos
            JOIN games_to_videos ON games_to_videos.video = videos.id
            WHERE games_to_videos.game = games.id)
            SQL;

        return <<<SQL
            (SELECT JSON_OBJECT(
                'artworks', $artworks,
                'screenshots', $screenshots,
                'videos', $videos))
            AS media
            SQL;
    }

    function getWebsitesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', websites.id,
                'url', websites.url))
            FROM websites
            JOIN games_to_websites ON games_to_websites.website = websites.id
            WHERE games_to_websites.game = games.id)
            AS websites
            SQL;
    }

    function getTimesToBeatSubquery()
    {
        return <<<SQL
            (SELECT JSON_OBJECT(
                'inputs', times_to_beat.inputs,
                'minimum', times_to_beat.minimum,
                'normal', times_to_beat.normal,
                'completionist', times_to_beat.completionist,
                'speedrun', times_to_beat.speedrun)
            FROM times_to_beat
            WHERE times_to_beat.game = games.id)
            AS timesToBeat
            SQL;
    }
}