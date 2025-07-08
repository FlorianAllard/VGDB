<?php

namespace Models;

use Abstract\AbstractModel;
use Entities\GameEntity;
use Exception;

class GameModel extends AbstractModel {
    protected string $linkedClass = GameEntity::class;

    function getGames($get): array|false
    {
        $subqueries = [
            $this->getCoversSubquery(),
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

    #region SUBQUERIES

    function getCoversSubquery()
    {
        return <<<SQL
            (SELECT JSON_OBJECT(
                'id', covers.id,
                'hero', covers.hero,
                'landscape', covers.landscape,
                'portrait', covers.portrait,
                'logo', covers.logo)
            FROM covers
            WHERE covers.game = games.id)
            AS covers
            SQL;
    }

    function getGenresSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', genres.id,
                'name', genres.name))
            FROM genres
            JOIN games_to_genres ON games_to_genres.game = games.id
            WHERE genres.id = games_to_genres.genre)
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
            JOIN games_to_platforms ON games_to_platforms.game = games.id
            WHERE platforms.id = games_to_platforms.platform)
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

    #endregion

    function addGame(GameEntity $game): void
    {
        $data = [
            "id" => $game->getID(),
            "name" => $game->getName(),
            "officialReleaseDate" => $game->getOfficialReleaseDate(),
            "summary" => $game->getSummary(),
            "premise" => $game->getPremise(),
            "createdAt" => time(),
            "updatedAt" => 0,
        ];
        $this->insertInto('games', $data);
    }

    function formatGameFromIGDB($raw): GameEntity
    {
        $game = new GameEntity;

        $game->setID($raw['id']);
        $game->setName($raw['name']);
        $game->setOfficialReleaseDate($raw['first_release_date']);
        $game->setSummary($raw['summary']);
        $game->setPremise($raw['storyline']);

        $this->addGame($game);

        $game->setCovers($this->formatAndInsertCovers($game->getID(), $raw));
        $game->setGenres($this->formatAndInsertGenres($game->getID(), $raw['genres']));
        $game->setPlatforms($this->formatAndInsertPlatforms($game->getID(), $raw['platforms']));

        return $game;
    }

    #region FORMATTING

    function formatAndInsertCovers($gameID, $raw): string
    {
        // Default to IGDB cover images if available
        $covers = [
            'portrait' =>isset($raw['cover']['image_id']) ? 'https://images.igdb.com/igdb/image/upload/t_cover_big/' . $raw['cover']['image_id'] . '.webp' : null,
            'landscape' => isset($raw['cover']['image_id']) ? 'https://images.igdb.com/igdb/image/upload/t_1080p/' . $raw['cover']['image_id'] . '.webp' : null,
            'hero' => null,
            'logo' => null,
        ];

        // Try to find a Steam ID from the game's websites
        $steamId = null;
        foreach ($raw['websites'] ?? [] as $website) {
            if (isset($website['url']) && str_contains($website['url'], 'steam')) {
                $steamId = basename(parse_url($website['url'], PHP_URL_PATH));
                break;
            }
        }

        // If a Steam ID is found, prefer Steam images if they exist
        if ($steamId) {
            $steamCovers = [
                'landscape' => 'https://steamcdn-a.akamaihd.net/steam/apps/' . $steamId . '/header.jpg',
                'portrait' => 'https://steamcdn-a.akamaihd.net/steam/apps/' . $steamId . '/library_600x900_2x.jpg',
                'hero' => 'https://steamcdn-a.akamaihd.net/steam/apps/' . $steamId . '/library_hero.jpg',
                'logo' => 'https://steamcdn-a.akamaihd.net/steam/apps/' . $steamId . '/logo.png',
            ];
            // Only use Steam images if they exist (checkImage returns true)
            foreach ($steamCovers as $key => $url) {
                if (checkImage($url)) {
                    $covers[$key] = $url;
                }
            }
        }

        $covers['game'] = $gameID;
        $covers = $this->insertInto('covers', $covers, true);
        unset($covers['game']);
        return json_encode($covers);
    }

    function formatAndInsertGenres($gameID, $rawGenres): string
    {
        $genres = [];
        $relations = [];

        foreach ($rawGenres as $rawGenre) {
            $genres[] = [
                'id' => $rawGenre['id'],
                'name' => $rawGenre['name'],
            ];
            $relations[] = [
                'game' => $gameID,
                'genre' => $rawGenre['id']
            ];
        }

        foreach ($genres as &$genre) {
            $genre = $this->insertInto('genres', $genre, true);
        }
        foreach ($relations as &$relation) {
            $relation = $this->insertInto('games_to_genres', $relation, true);
        }

        return json_encode($genres);
    }

    function formatAndInsertPlatforms($gameID, $rawPlatforms): string
    {
        $platforms = [];
        $families = [];
        $relations = [];

        foreach ($rawPlatforms as $rawPlatform)
        {
            if(isset($rawPlatform['platform_family'])) {
                $families[] = [
                    'id' => $rawPlatform['platform_family']['id'],
                    'name' => $rawPlatform['platform_family']['name'],
                ];
            }

            $platforms[] = [
                'id' => $rawPlatform['id'],
                'name' => $rawPlatform['name'],
                'family' => isset($rawPlatform['platform_family']) ? $rawPlatform['platform_family']['id'] : null,
                'generation' => $rawPlatform['generation'] ?? 0,
            ];

            $relations[] = [
                'game' => $gameID,
                'platform' => $rawPlatform['id'],
            ];
        }

        foreach ($families as &$family) {
            $family = $this->insertInto('platform_families', $family, true);
        }
        foreach ($platforms as &$platform) {
            $platform = $this->insertInto('platforms', $platform, true);
            if(isset($platform['family'])) {
                $platform['family'] = array_find($families, function ($value) use ($platform) {
                    return $value['id'] == $platform['family'];
                });
            }
        }
        foreach ($relations as &$relation) {
            $relation = $this->insertInto('games_to_platforms', $relation, true);
        }

        return json_encode($platforms);
    }

    #endregion
}