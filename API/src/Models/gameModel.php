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
            "SELECT *, %s FROM Games $where",
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
                'id', Covers.id,
                'hero', Covers.hero,
                'landscape', Covers.landscape,
                'portrait', Covers.portrait,
                'logo', Covers.logo)
            FROM Covers
            WHERE Covers.game_id = Games.id)
            AS covers
            SQL;
    }

    function getGenresSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Genres.id,
                'name', Genres.name))
            FROM Genres
            JOIN Games_Genres ON Games_Genres.game_id = Games.id
            WHERE Genres.id = Games_Genres.genre_id)
            AS genres
            SQL;
    }

    function getPlatformsSubquery()
    {
        $family = <<<SQL
            (SELECT JSON_OBJECT(
                'id', PlatformFamilies.id,
                'name', PlatformFamilies.name)
            FROM PlatformFamilies
            WHERE PlatformFamilies.id = Platforms.family_id)
            SQL;

        return <<<SQL
            (SELECT  JSON_ARRAYAGG(JSON_OBJECT(
                'id', Platforms.id,
                'name', Platforms.name,
                'family', $family,
                'generation', Platforms.generation))
            FROM Platforms
            JOIN Games_Platforms ON Games_Platforms.game_id = Games.id
            WHERE Platforms.id = Games_Platforms.platform_id)
            AS platforms
            SQL;
    }

    function getModesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', GameModes.id,
                'name', GameModes.name))
            FROM GameModes
            JOIN Games_GameModes ON Games_GameModes.game_id = Games.id
            WHERE GameModes.id = Games_GameModes.mode_id)
            AS gameModes
            SQL;
    }

    function getPerspectivesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', PlayerPerspectives.id,
                'name', PlayerPerspectives.name))
            FROM PlayerPerspectives
            JOIN Games_PlayerPerspectives ON Games_PlayerPerspectives.game_id = Games.id
            WHERE PlayerPerspectives.id = Games_PlayerPerspectives.perspective_id)
            AS playerPerspectives
            SQL;
    }

    function getThemesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Themes.id,
                'name', Themes.name))
            FROM Themes
            JOIN Games_Themes ON Games_Themes.game_id = Games.id
            WHERE Themes.id = Games_Themes.theme_id)
            AS themes
            SQL;
    }

    function getCompaniesSubquery()
    {
        $developers = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Companies.id,
                'name', Companies.name))
            FROM Companies
            JOIN Games_Developers ON Games_Developers.game_id = Games.id
            WHERE Companies.id = Games_Developers.company_id)
            SQL;

        $publishers = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Companies.id,
                'name', Companies.name))
            FROM Companies
            JOIN Games_Publishers ON Games_Publishers.game_id = Games.id
            WHERE Companies.id = Games_Publishers.company_id)
            SQL;

        return <<<SQL
            (SELECT JSON_OBJECT(
                'mainDevelopers', $developers,
                'publishers', $publishers))
            AS involvedCompanies
            SQL;
    }

    function getEnginesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Engines.id,
                'name', Engines.name))
            FROM Engines
            JOIN Games_Engines ON Games_Engines.game_id = Games.id
            WHERE Engines.id = Games_Engines.engine_id)
            AS engines
            SQL;
    }

    function getSeriesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', GameSeries.id,
                'name', GameSeries.name))
            FROM GameSeries
            JOIN Games_GameSeries ON Games_GameSeries.game_id = Games.id
            WHERE GameSeries.id = Games_GameSeries.series_id)
            AS gameSeries
            SQL;
    }

    function getFranchisesSubquery()
    {
        return <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Franchises.id,
                'name', Franchises.name))
            FROM Franchises
            JOIN Games_Franchises ON Games_Franchises.game_id = Games.id
            WHERE Franchises.id = Games_Franchises.franchise_id)
            AS franchises
            SQL;
    }

    function getLanguagesSubquery()
    {
        $dubbings = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Languages.id,
                'name', Languages.name))
            FROM Languages
            JOIN Games_Dubbings ON Games_Dubbings.game_id = Games.id
            WHERE Languages.id = Games_Dubbings.language_id)
            SQL;

        $subtitles = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Languages.id,
                'name', Languages.name))
            FROM Languages
            JOIN Games_Subtitles ON Games_Subtitles.game_id = Games.id
            WHERE Languages.id = Games_Subtitles.language_id)
            SQL;

        $translations = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Languages.id,
                'name', Languages.name))
            FROM Languages
            JOIN Games_Translations ON Games_Translations.game_id = Games.id
            WHERE Languages.id = Games_Translations.language_id)
            SQL;

        return <<<SQL
            (SELECT JSON_OBJECT(
                'dubbings', $dubbings,
                'subtitles', $subtitles,
                'translations', $translations))
            AS supportedLanguages
            SQL;
    }

    function getAgeRatingsSubquery()
    {
        $system = <<<SQL
            (SELECT JSON_OBJECT(
                'id', AgeRatingSystems.id,
                'name', AgeRatingSystems.name,
                'country', AgeRatingSystems.country)
            FROM AgeRatingSystems
            WHERE AgeRatingSystems.id = AgeRatings.system_id)
            SQL;

        $contents = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', AgeRatingContents.id,
                'description', AgeRatingContents.description))
            FROM AgeRatingContents
            JOIN AgeRatings_AgeRatingContents ON AgeRatings_AgeRatingContents.content_id = AgeRatingContents.id
            WHERE AgeRatings_AgeRatingContents.rating_id = AgeRatings.id)
            SQL;

        return <<<SQL
            (SELECT  JSON_ARRAYAGG(JSON_OBJECT(
                'id', AgeRatings.id,
                'rating', AgeRatings.rating,
                'system', $system,
                'contents', $contents))
            FROM AgeRatings
            WHERE AgeRatings.game_id = Games.id)
            AS ageRatings
            SQL;
    }

    function getRegionalReleasesSubquery()
    {
        $families = <<<SQL
            (SELECT JSON_OBJECT(
                'id', PlatformFamilies.id,
                'name', PlatformFamilies.name)
            FROM PlatformFamilies
            WHERE PlatformFamilies.id = Platforms.family_id)
            SQL;

        $platforms = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Platforms.id,
                'name', Platforms.name,
                'family', $families,
                'generation', Platforms.generation))
            FROM Platforms
            JOIN RegionalReleases_Platforms ON RegionalReleases_Platforms.platform_id = Platforms.id
            WHERE RegionalReleases_Platforms.release_id = RegionalReleases.id)
            SQL;

        $regions = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Regions.id,
                'name', Regions.name))
            FROM Regions
            JOIN RegionalReleases_Regions ON RegionalReleases_Regions.region_id = Regions.id
            WHERE RegionalReleases_Regions.release_id = RegionalReleases.id)
            SQL;

        $type = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', ReleaseTypes.id,
                'name', ReleaseTypes.name))
            FROM ReleaseTypes
            WHERE ReleaseTypes.id = RegionalReleases.type_id)
            SQL;

        return <<<SQL
            (SELECT  JSON_ARRAYAGG(JSON_OBJECT(
                'id', RegionalReleases.id,
                'date', RegionalReleases.date,
                'platforms', $platforms,
                'regions', $regions,
                'type', $type))
            FROM RegionalReleases
            WHERE RegionalReleases.game_id = Games.id)
            AS regionalReleases
            SQL;
    }

    function getMediaSubquery()
    {
        $artworks = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Artworks.id,
                'url', Artworks.url))
            FROM Artworks
            JOIN Games_Artworks ON Games_Artworks.artwork_id = Artworks.id
            WHERE Games_Artworks.game_id = Games.id)
            SQL;

        $screenshots = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Screenshots.id,
                'url', Screenshots.url))
            FROM Screenshots
            JOIN Games_Screenshots ON Games_Screenshots.screenshot_id = Screenshots.id
            WHERE Games_Screenshots.game_id = Games.id)
            SQL;

        $videos = <<<SQL
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'id', Videos.id,
                'name', Videos.name,
                'thumbnail', Videos.thumbnail,
                'url', Videos.url))
            FROM Videos
            JOIN Games_Videos ON Games_Videos.video_id = Videos.id
            WHERE Games_Videos.game_id = Games.id)
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
                'id', Websites.id,
                'url', Websites.url))
            FROM Websites
            JOIN Games_Websites ON Games_Websites.website_id = Websites.id
            WHERE Games_Websites.game_id = Games.id)
            AS websites
            SQL;
    }

    function getTimesToBeatSubquery()
    {
        return <<<SQL
            (SELECT JSON_OBJECT(
                'inputs', TimesToBeat.inputs,
                'minimum', TimesToBeat.minimum,
                'normal', TimesToBeat.normal,
                'completionist', TimesToBeat.completionist,
                'speedrun', TimesToBeat.speedrun)
            FROM TimesToBeat
            WHERE TimesToBeat.game_id = Games.id)
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
            "updatedAt" => time(),
        ];
        $this->insertInto('Games', $data);
    }

    function formatGameFromIGDB($raw): GameEntity
    {
        $game = new GameEntity;

        $game->setID($raw['id']);
        $game->setName($raw['name']);
        $game->setOfficialReleaseDate($raw['first_release_date']);
        $game->setSummary($raw['summary']);
        $game->setPremise($raw['storyline']);
        $game->setCreatedAt(time());
        $game->setUpdatedAt(time());

        $this->addGame($game);

        $game->setCovers($this->formatAndInsertCovers($game->getID(), $raw));
        $game->setGenres($this->formatAndInsertGenres($game->getID(), $raw['genres']));
        $game->setPlatforms($this->formatAndInsertPlatforms($game->getID(), $raw['platforms']));
        $game->setModes($this->formatAndInsertModes($game->getID(), $raw['game_modes']));
        $game->setPerspectives($this->formatAndInsertPerspectives($game->getID(), $raw['game_modes']));

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

        $covers['game_id'] = $gameID;
        $covers = $this->insertInto('Covers', $covers, true);
        unset($covers['game_id']);
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
                'game_id' => $gameID,
                'genre_id' => $rawGenre['id']
            ];
        }

        foreach ($genres as &$genre) {
            $genre = $this->insertInto('Genres', $genre, true);
        }
        foreach ($relations as &$relation) {
            $relation = $this->insertInto('Games_Genres', $relation, true);
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
                'family_id' => isset($rawPlatform['platform_family']) ? $rawPlatform['platform_family']['id'] : null,
                'generation' => $rawPlatform['generation'] ?? 0,
            ];

            $relations[] = [
                'game_id' => $gameID,
                'platform_id' => $rawPlatform['id'],
            ];
        }

        foreach ($families as &$family) {
            $family = $this->insertInto('PlatformFamilies', $family, true);
        }
        foreach ($platforms as &$platform) {
            $platform = $this->insertInto('Platforms', $platform, true);
            if(isset($platform['family'])) {
                $platform['family'] = array_find($families, function ($value) use ($platform) {
                    return $value['id'] == $platform['family'];
                });
            }
        }
        foreach ($relations as &$relation) {
            $relation = $this->insertInto('Games_Platforms', $relation, true);
        }

        return json_encode($platforms);
    }

    function formatAndInsertModes($gameID, $rawModes): string 
    {
        $modes = [];
        $relations = [];

        foreach ($rawModes as $rawMode) {
            $modes[] = [
                'id' => $rawMode['id'],
                'name' => $rawMode['name'],
            ];

            $relations[] = [
                'game_id' => $gameID,
                'mode_id' => $rawMode['id'],
            ];
        }

        foreach ($modes as &$mode) {
            $mode = $this->insertInto('GameModes', $mode, true);
        }
        foreach ($relations as &$relation) {
            $relation = $this->insertInto('Games_GameModes', $relation, true);
        }

        return json_encode($modes);
    }

    function formatAndInsertPerspectives($gameID, $raw): string 
    {
        $perspectives = [];
        $relations = [];

        foreach ($raw as $r) {
            $perspectives[] = [
                'id' => $r['id'],
                'name' => $r['name'],
            ];

            $relations[] = [
                'game_id' => $gameID,
                'perspective_id' => $r['id'],
            ];
        }

        foreach ($perspectives as &$p) {
            $p = $this->insertInto('PlayerPerspectives', $p, true);
        }
        foreach ($relations as &$r) {
            $r = $this->insertInto('Games_PlayerPerspectives', $r, true);
        }

        return json_encode($perspectives);
    }

    #endregion
}