<?php

namespace Models;

use Abstract\AbstractModel;
use Entities\GameEntity;
use IGDB;

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
            "createdAt" => $game->getCreatedAt(),
            "updatedAt" => $game->getUpdatedAt(),
        ];
        $this->insertInto('Games', $data);
    }

    function formatGameFromIGDB($raw, $timesToBeat): GameEntity
    {
        $game = new GameEntity;

        $game->setID($raw['id']);
        $game->setName($raw['name']);
        $game->setOfficialReleaseDate(isset($raw['first_release_date']) ? $raw['first_release_date'] : 0);
        $game->setSummary(isset($raw['summary']) ? $raw['summary'] : "");
        $game->setPremise(isset($raw['storyline']) ? $raw['storyline'] : "");
        $game->setCreatedAt(time());
        $game->setUpdatedAt(time());

        $this->addGame($game);

        $this->formatAndInsertCovers($game->getID(), $raw);
        if (isset($raw['genres'])) {
            $this->formatAndInsertGenres($game->getID(), $raw['genres']);
        }
        if (isset($raw['platforms'])) {
            $this->formatAndInsertPlatforms($game->getID(), $raw['platforms']);
        }
        if (isset($raw['game_modes'])) {
            $this->formatAndInsertModes($game->getID(), $raw['game_modes']);
        }
        if (isset($raw['player_perspectives'])) {
            $this->formatAndInsertPerspectives($game->getID(), $raw['player_perspectives']);
        }
        if (isset($raw['themes'])) {
            $this->formatAndInsertThemes($game->getID(), $raw['themes']);
        }
        if (isset($raw['involved_companies'])) {
            $this->formatAndInsertCompanies($game->getID(), $raw['involved_companies']);
        }
        if (isset($raw['game_engines'])) {
           $this->formatAndInsertEngines($game->getID(), $raw['game_engines']);
        }
        if (isset($raw['collections'])) {
           $this->formatAndInsertSeries($game->getID(), $raw['collections']);
        }
        if (isset($raw['franchises'])) {
            $this->formatAndInsertFranchises($game->getID(), $raw['franchises']);
        }
        if (isset($raw['language_supports'])) {
            $this->formatAndInsertLanguages($game->getID(), $raw['language_supports']);
        }
        if (isset($raw['age_ratings'])) {
            $this->formatAndInsertAgeRatings($game->getID(), $raw['age_ratings']);
        }
        if (isset($raw['release_dates'])) {
            $this->formatAndInsertReleases($game->getID(), $raw['release_dates']);
        }
        if (isset($raw['release_dates'])) {
            $this->formatAndInsertReleases($game->getID(), $raw['release_dates']);
        }
        $rawArtworks = isset($raw['artworks']) ? $raw['artworks'] : [];
        $rawScreenshots = isset($raw['screenshots']) ? $raw['screenshots'] : [];
        $rawVideos = isset($raw['videos']) ? $raw['videos'] : [];
        if (!empty($rawArtworks) || !empty($rawScreenshots) || !empty($rawVideos)) {
            $this->formatAndInsertMedia($game->getID(), $rawArtworks, $rawScreenshots, $rawVideos);
        }
        if (isset($raw['websites'])) {
            $this->formatAndInsertWebsites($game->getID(), $raw['websites']);
        }
        if ($timesToBeat) {
            $this->formatAndInsertTimesToBeat($game->getID(), $raw['slug'], $timesToBeat);
        }
        
        return $game;
    }

    #region FORMATTING

    function formatAndInsertCovers($gameID, $raw): void
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
    }

    function formatAndInsertGenres($gameID, $rawGenres): void
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
    }

    function formatAndInsertPlatforms($gameID, $rawPlatforms): void
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
        }
        foreach ($relations as &$relation) {
            $relation = $this->insertInto('Games_Platforms', $relation, true);
        }
    }

    function formatAndInsertModes($gameID, $rawModes): void 
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
    }

    function formatAndInsertPerspectives($gameID, $raw): void 
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
    }

    function formatAndInsertThemes($gameID, $raw): void 
    {
        $themes = [];
        $relations = [];

        foreach ($raw as $r) {
            $themes[] = [
                'id' => $r['id'],
                'name' => $r['name'],
            ];

            $relations[] = [
                'game_id' => $gameID,
                'theme_id' => $r['id'],
            ];
        }

        foreach ($themes as &$p) {
            $p = $this->insertInto('Themes', $p, true);
        }
        foreach ($relations as &$r) {
            $r = $this->insertInto('Games_Themes', $r, true);
        }
    }

    function formatAndInsertCompanies($gameID, $raw): void
    {
        $developers = [];
        $developerRelations = [];
        $publishers = [];
        $publisherRelations = [];

        foreach ($raw as $r) {
            if($r['developer'] || $r['supporting'] ||  $r['porting'])
            {
                $developers[] = [
                    'id' => $r['company']['id'],
                    'name' => $r['company']['name'],
                ];

                $developerRelations[] = [
                    'game_id' => $gameID,
                    'company_id' => $r['company']['id'],
                ];
            } else if ($r['publisher'])
            {
                $publishers[] = [
                    'id' => $r['company']['id'],
                    'name' => $r['company']['name'],
                ];

                $publisherRelations[] = [
                    'game_id' => $gameID,
                    'company_id' => $r['company']['id'],
                ];
            }
        }

        foreach ($developers as &$d) {
            $d = $this->insertInto('Companies', $d, true);
        }
        foreach ($publishers as &$p) {
            $p = $this->insertInto('Companies', $p, true);
        }
        foreach ($developerRelations as &$r) {
            $r = $this->insertInto('Games_Developers', $r, true);
        }
        foreach ($publisherRelations as &$r) {
            $r = $this->insertInto('Games_Publishers', $r, true);
        }
    }

    function formatAndInsertEngines($gameID, $raw): void
    {
        $engines = [];
        $relations = [];

        foreach ($raw as $r) {
            $engines[] = [
                'id' => $r['id'],
                'name' => $r['name'],
            ];

            $relations[] = [
                'game_id' => $gameID,
                'engine_id' => $r['id'],
            ];
        }

        foreach ($engines as &$e) {
            $e = $this->insertInto('Engines', $e, true);
        }
        foreach ($relations as &$r) {
            $r = $this->insertInto('Games_Engines', $r, true);
        }
    }

    function formatAndInsertSeries($gameID, $raw): void
    {
        $series = [];
        $relations = [];

        foreach ($raw as $r) {
            $series[] = [
                'id' => $r['id'],
                'name' => $r['name'],
            ];

            $relations[] = [
                'game_id' => $gameID,
                'series_id' => $r['id'],
            ];
        }

        foreach ($series as &$s) {
            $s = $this->insertInto('GameSeries', $s, true);
        }
        foreach ($relations as &$r) {
            $r = $this->insertInto('Games_GameSeries', $r, true);
        }
    }

    function formatAndInsertFranchises($gameID, $raw): void
    {
        $franchises = [];
        $relations = [];

        foreach ($raw as $r) {
            $franchises[] = [
                'id' => $r['id'],
                'name' => $r['name'],
            ];

            $relations[] = [
                'game_id' => $gameID,
                'franchise_id' => $r['id'],
            ];
        }

        foreach ($franchises as &$f) {
            $f = $this->insertInto('Franchises', $f, true);
        }
        foreach ($relations as &$r) {
            $r = $this->insertInto('Games_Franchises', $r, true);
        }
    }

    function formatAndInsertLanguages($gameID, $raw): void
    {
        $dubbings = [];
        $dubbingsRelations = [];

        $subtitles = [];
        $subtitlesRelations = [];

        $translations = [];
        $translationsRelations = [];

        foreach ($raw as $r) {
            $l = [
                'id' => $r['language']['id'],
                'name' => $r['language']['name'],
            ];
            $rl = [
                'game_id' => $gameID,
                'language_id' => $r['language']['id'],
            ];

            switch ($r['language_support_type']['name']) {
                case 'Audio':
                    $dubbings[] =$l;
                    $dubbingsRelations[] = $rl;
                    break;

                case 'Subtitles':
                    $subtitles[] = $l;
                    $subtitlesRelations[] = $rl;
                    break;

                case 'Interface':
                    $translations[] = $l;
                    $translationsRelations[] = $rl;
                    break;
            }
        }

        $languages = array_map('unserialize', array_unique(array_map('serialize', array_merge($dubbings, $subtitles, $translations))));
        foreach ($languages as &$l) {
            $l = $this->insertInto('Languages', $l, true);
        }
        foreach ($dubbingsRelations as &$d) {
            $d = $this->insertInto('Games_Dubbings', $d, true);
        }
        foreach ($subtitlesRelations as &$s) {
            $s = $this->insertInto('Games_Subtitles', $s, true);
        }
        foreach ($translationsRelations as &$t) {
            $t = $this->insertInto('Games_Translations', $t, true);
        }
    }

    function formatAndInsertAgeRatings($gameID, $raw): void
    {
        $ageRatings = [];
        $contents = [];
        $systems = [];
        $relations = [];

        $countries = [
            'ESRB' => "USA & Canada",
            'PEGI' => "Europe",
            'CERO' => "Japan",
            'USK' => "Germany",
            'GRAC' => "South Korea",
            'CLASS_IND' => "Brazil",
            'ACB' => "Australia",
        ];

        foreach ($raw as $r) {
            $ageRatings[] = [
                'id' => $r['id'],
                'rating' => $r['rating'],
                'game_id' => $gameID,
                'system_id' => $r['organization']['id'],
            ];

            if(isset($r['rating_content_descriptions'])) {
                foreach ($r['rating_content_descriptions'] as $rcd) {
                    $c = [
                        'id' => $rcd['id'],
                        'description' => $rcd['description'],
                    ];

                    if (!in_array($c, $contents)) {
                        $contents[] = $c;
                    }

                    $relations[] = [
                        'rating_id' => $r['id'],
                        'content_id' => $rcd['id'],
                    ];
                }
            }

            $systems[] = [
                'id' => $r['organization']['id'],
                'name' => $r['organization']['name'],
                'country' => $countries[$r['organization']['name']],
            ];
        }
        
        foreach ($systems as &$system) {
            $system = $this->insertInto('AgeRatingSystems', $system, true);
        }
        foreach ($contents as &$content) {
            $content = $this->insertInto('AgeRatingContents', $content, true);
        }
        foreach ($ageRatings as &$ageRating) {
            $ageRating = $this->insertInto('AgeRatings', $ageRating, true);
        }
        foreach ($relations as &$relation) {
            $relation = $this->insertInto('AgeRatings_AgeRatingContents', $relation, true);
        }
    }

    function formatAndInsertReleases($gameID, $raw): void
    {
        //Objects creation
        $regionalReleases = [];
        $types = [];

        $regions = [];
        $regionRelations = [];

        $platforms = [];
        $platformRelations = [];
        $platformFamilies = [];

        foreach ($raw as $rawRelease) {
            $item = array_find($regionalReleases, function($value) use ($rawRelease) {
                return $value['date'] == $rawRelease['date'];
            });

            if(!$item)
            {
                $item = [
                    'id' => $rawRelease['id'],
                    'game_id' => $gameID,
                    'date' => $rawRelease['date'],
                    'type_id' => isset($rawRelease['status']) ? $rawRelease['status']['id'] : 6,
                ];
                $regionalReleases[] = $item;

                if(isset($rawRelease['status'])
                && !in_array($rawRelease['status']['id'], array_column($types, 'id'))) {
                    $types[] = [
                        'id' => $rawRelease['status']['id'],
                        'name' => $rawRelease['status']['name'],
                    ];
                }
            }

            if (!in_array($rawRelease['release_region']['id'], array_column($regions, 'id'))) {
                $regions[] = [
                    'id' => $rawRelease['release_region']['id'],
                    'name' => ucwords($rawRelease['release_region']['region']),
                ];
            }
            if (!in_array($item['id'], array_column($platformRelations, 'release_id'))
            || !in_array($rawRelease['release_region']['id'], array_column($platformRelations, 'region_id'))
            ) {
                $regionRelations[] = [
                    'release_id' => $item['id'],
                    'region_id' => $rawRelease['release_region']['id'],
                ];
        }

            if (!in_array($rawRelease['platform']['id'], array_column($platforms, 'id'))) {
                $platforms[] = [
                    'id' => $rawRelease['platform']['id'],
                    'name' => $rawRelease['platform']['name'],
                    'family_id' => isset($rawRelease['platform']['platform_family']) ? $rawRelease['platform']['platform_family']['id'] : null,
                    'generation' => $rawRelease['platform']['generation'] ?? 0,
                ];
            }
            if (isset($rawRelease['platform']['platform_family'])
            && !in_array($rawRelease['platform']['platform_family']['id'], array_column($platformFamilies, 'id'))) {
                $platformFamilies[] = [
                    'id' => $rawRelease['platform']['platform_family']['id'],
                    'name' => $rawRelease['platform']['platform_family']['name'],
                ];
            }

            if (!in_array($item['id'], array_column($platformRelations, 'release_id'))
            || !in_array($rawRelease['platform']['id'], array_column($platformRelations, 'platform_id'))) {
                $platformRelations[] = [
                    'release_id' => $item['id'],
                    'platform_id' => $rawRelease['platform']['id'],
                ];
            }
        }

        //Inserts
        foreach ($types as &$type) {
            $type = $this->insertInto('ReleaseTypes', $type, true);
        }
        foreach ($regionalReleases as &$regionalRelease) {
            $regionalRelease = $this->insertInto('RegionalReleases', $regionalRelease, true);
        }

        foreach ($regions as &$region) {
            $region = $this->insertInto('Regions', $region, true);
        }
        foreach ($regionRelations as &$regionRelation) {
            $regionRelation = $this->insertInto('RegionalReleases_Regions', $regionRelation, true);
        }

        foreach ($platformFamilies as &$platformFamily) {
            $platformFamily = $this->insertInto('PlatformFamilies', $platformFamily, true);
        }
        foreach ($platforms as &$platform) {
            $platform = $this->insertInto('Platforms', $platform, true);
        }
        foreach ($platformRelations as &$platformRelation) {
            $platformRelation = $this->insertInto('RegionalReleases_Platforms', $platformRelation, true);
        }
    }

    function formatAndInsertMedia($gameID, $rawArtworks, $rawScreenshots, $rawVideos): void
    {
        //Objects creation
        $artworks = [];
        $artworkRelations = [];

        $screenshots = [];
        $screenshotRelations = [];

        $videos = [];
        $videoRelations = [];

        foreach ($rawArtworks as $rawArtwork) {
            $artworks[] = [
                'id' => $rawArtwork['id'],
                'url' => 'https://images.igdb.com/igdb/image/upload/t_1080p/' . $rawArtwork['image_id'] . '.webp',
            ];
            $artworkRelations[] = [
                'game_id' => $gameID,
                'artwork_id' => $rawArtwork['id'],
            ];
        }

        foreach ($rawScreenshots as $rawScreenshot) {
            $screenshots[] = [
                'id' => $rawScreenshot['id'],
                'url' => 'https://images.igdb.com/igdb/image/upload/t_1080p/' . $rawScreenshot['image_id'] . '.webp',
            ];
            $screenshotRelations[] = [
                'game_id' => $gameID,
                'screenshot_id' => $rawScreenshot['id'],
            ];
        }

        foreach ($rawVideos as $rawVideo) {
            $videos[] = [
                'id' => $rawVideo['id'],
                'name' => $rawVideo['name'],
                'thumbnail' => "https://img.youtube.com/vi/" . $rawVideo['video_id'] . "/0.jpg",
                'url' => 'https://www.youtube.com/embed/' . $rawVideo['video_id'],
            ];
            $videoRelations[] = [
                'game_id' => $gameID,
                'video_id' => $rawVideo['id'],
            ];
        }


        //Inserts
        foreach ($artworks as $artwork) {
            $this->insertInto('Artworks', $artwork, true);
        }
        foreach ($artworkRelations as $artworkRelation) {
            $this->insertInto('Games_Artworks', $artworkRelation, true);
        }

        foreach ($screenshots as $screenshot) {
            $this->insertInto('Screenshots', $screenshot, true);
        }
        foreach ($screenshotRelations as $screenshotRelation) {
            $this->insertInto('Games_Screenshots', $screenshotRelation, true);
        }

        foreach ($videos as $video) {
            $this->insertInto('Videos', $video, true);
        }
        foreach ($videoRelations as $videoRelation) {
            $this->insertInto('Games_Videos', $videoRelation, true);
        }
    }

    function formatAndInsertWebsites($gameID, $rawWebsites): void
    {
        //Objects creation
        $websites = [];
        $websiteRelations = [];

        foreach ($rawWebsites as $rawWebsite) {
            $websites[] = [
                'id' => $rawWebsite['id'],
                'url' => $rawWebsite['url'],
            ];
            $websiteRelations[] = [
                'game_id' => $gameID,
                'website_id' => $rawWebsite['id'],
            ];
        }


        //Inserts
        foreach ($websites as $website) {
            $this->insertInto('Websites', $website, true);
        }
        foreach ($websiteRelations as $websiteRelation) {
            $this->insertInto('Games_Websites', $websiteRelation, true);
        }
    }

    function formatAndInsertTimesToBeat($gameID, $gameSlug, $rawTimes)
    {
        // Object creation
        $igdb = new IGDB();
        $timesToBeat = [
            'id' => $rawTimes['id'],
            'game_id' => $gameID,
            'inputs' => $rawTimes['count'],
            'minimum' => isset($rawTimes['hastily']) ? $rawTimes['hastily'] : 0,
            'normal' => isset($rawTimes['normally']) ? $rawTimes['normally'] : 0,
            'completionist' => isset($rawTimes['completely']) ? $rawTimes['completely'] : 0,
            'speedrun' => $igdb->requestSpeedrun($gameSlug),
        ];

        // Inserts
        $this->insertInto('TimesToBeat', $timesToBeat, true);
    }

    #endregion
}