<?php

require_once __DIR__ . '/../services/_debug.php';
require_once __DIR__ . '/../services/_pdo.php';
require_once __DIR__ . '/../services/_igdb.php';
require_once __DIR__ . '/../services/_utilities.php';

/** Exports games with their related genres, platforms, modes, perspectives, and themes.
 *
 * @param array $ids Array of game IDs to export.
 * @return array Exported games with related data.
 */
function exportGames(array $ids): array
{
    $pdo = pdoConnection();

    // Prepare placeholders for the IN clause
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    // Get SQL fragments for related entities
    $statements = [
        'genres' => getGenreStatements(),
        'platforms' => getPlatformStatements(),
        'modes' => getModeStatements(),
        'perspectives' => getPerspectiveStatements(),
        'themes' => getThemeStatements(),
        'involved_companies' => getCompaniesStatements(),
        'engines' => getEngineStatements(),
        'series' => getSeriesStatements(),
        'franchises' => getFranchiseStatements(),
        'supported_languages' => getLanguageStatements(),
        'age_ratings' => getAgeRatingStatements(),
        'regional_releases' => getRegionalReleaseStatements(),
        'media' => getMediaStatements(),
        'websites' => getWebsiteStatements(),
    ];

    // Build the SELECT part for JSON columns
    $jsonSelects = [];
    foreach ($statements as $key => $stmt) {
        $jsonSelects[] = $stmt['json'];
    }

    // Build the JOIN part for related tables
    $joins = [];
    foreach ($statements as $key => $stmt) {
        $joins[] = $stmt['join'];
    }

    // Prepare the SQL query
    $sql = sprintf(
        "SELECT games.*, %s
        FROM games %s
        WHERE games.id IN (%s)
        GROUP BY games.id",
        implode(",\n", $jsonSelects),
        implode("\n", $joins),
        $placeholders
    );

    $stmt = $pdo -> prepare($sql);
    $stmt -> execute($ids);
    $games = $stmt -> fetchAll(PDO::FETCH_ASSOC);

    // Decode JSON columns into arrays
    foreach ($games as $i => $game) {
        $games[$i]['genres'] = json_decode($game['genres'], true);
        $games[$i]['platforms'] = json_decode($game['platforms'], true);
        $games[$i]['modes'] = json_decode($game['modes'], true);
        $games[$i]['perspectives'] = json_decode($game['perspectives'], true);
        $games[$i]['themes'] = json_decode($game['themes'], true);
        $games[$i]['involved_companies'] = json_decode($game['involved_companies'], true);
        $games[$i]['engines'] = json_decode($game['engines'], true);
        $games[$i]['series'] = json_decode($game['series'], true);
        $games[$i]['franchises'] = json_decode($game['franchises'], true);
        $games[$i]['supported_languages'] = json_decode($game['supported_languages'], true);
        $games[$i]['age_ratings'] = json_decode($game['age_ratings'], true);
        foreach ($games[$i]['age_ratings'] as $key => $value) {
            $games[$i]['age_ratings'][$key]['system'] = json_decode($value['system'], true);
        }
        $games[$i]['regional_releases'] = json_decode($game['regional_releases'], true);
        foreach ($games[$i]['regional_releases'] as $key => $value) {
            $games[$i]['regional_releases'][$key]['type'] = json_decode($value['type'], true);
        }
        $games[$i]['media'] = json_decode($game['media'], true);
        $games[$i]['websites'] = json_decode($game['websites'], true);
    }

    return $games;
}

/** Returns SQL fragments for joining and aggregating genres.
 */
function getGenreStatements(): array
{
    return [
        'json' => "
            IF(COUNT(DISTINCT genres.id) = 0, '',
                JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                'id', genres.id, 
                'name', genres.name))
            )
            AS genres",
        'join' => "
            LEFT JOIN games_to_genres ON games.id = games_to_genres.game_id
            LEFT JOIN genres ON games_to_genres.genre_id = genres.id"
    ];
}

/** Returns SQL fragments for joining and aggregating platforms.
 */
function getPlatformStatements(): array
{
    return [
        'json' => "
            IF(COUNT(DISTINCT platforms.id) = 0, '',
                JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
               'id', platforms.id,
                'name', platforms.name,
                'family_id', 
                    IF(platform_families.id IS NOT NULL, JSON_OBJECT(
                        'id', platform_families.id,
                        'name', platform_families.name),
                    NULL),
                'generation', platforms.generation))
            )
            AS platforms",
        'join' => "
            LEFT JOIN games_to_platforms ON games.id = games_to_platforms.game_id
            LEFT JOIN platforms ON games_to_platforms.platform_id = platforms.id
            LEFT JOIN platform_families ON platforms.family_id = platform_families.id"
    ];
}

/** Returns SQL fragments for joining and aggregating modes.
 */
function getModeStatements(): array
{
    return [
        'json' => "
            IF(COUNT(DISTINCT modes.id) = 0, '',
                JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                'id', modes.id, 
                'name', modes.name))
            )
            AS modes",
        'join' => "
            LEFT JOIN games_to_modes ON games.id = games_to_modes.game_id
            LEFT JOIN modes ON games_to_modes.mode_id = modes.id"
    ];
}

/** Returns SQL fragments for joining and aggregating perspectives.
 */
function getPerspectiveStatements(): array
{
    return [
        'json' => "
            IF(COUNT(DISTINCT perspectives.id) = 0, '',
                JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                'id', perspectives.id, 
                'name', perspectives.name))
            )
            AS perspectives",
        'join' => "
            LEFT JOIN games_to_perspectives ON games.id = games_to_perspectives.game_id
            LEFT JOIN perspectives ON games_to_perspectives.perspective_id = perspectives.id"
    ];
}

/** Returns SQL fragments for joining and aggregating themes.
 */
function getThemeStatements(): array
{
    return [
        'json' => "
            IF(COUNT(DISTINCT themes.id) = 0, '',
                JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                'id', themes.id, 
                'name', themes.name))
            )
            AS themes",
        'join' => "
            LEFT JOIN games_to_themes ON games.id = games_to_themes.game_id
            LEFT JOIN themes ON games_to_themes.theme_id = themes.id"
    ];
}

/** Returns SQL fragments for joining and aggregating involved companies.
 */
function getCompaniesStatements(): array
{
    return [
        'json' => "
            JSON_OBJECT(
                'main_developers', 
                    IF(COUNT(DISTINCT developers.id) = 0, 
                        NULL, 
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', developers.id,
                            'name', developers.name
                        ))
                    ),
                'supporting_developers', 
                    IF(COUNT(DISTINCT supporting.id) = 0, 
                        NULL, 
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', supporting.id,
                            'name', supporting.name
                        ))
                    ),
                 'publishers', 
                    IF(COUNT(DISTINCT publishers.id) = 0, 
                        NULL, 
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', publishers.id,
                            'name', publishers.name
                        ))
                    )
            ) AS involved_companies",
        'join' => "
            LEFT JOIN games_to_developers ON games.id = games_to_developers.game_id
            LEFT JOIN companies developers ON games_to_developers.company_id = developers.id
            LEFT JOIN games_to_supporting ON games.id = games_to_supporting.game_id
            LEFT JOIN companies supporting ON games_to_supporting.company_id = supporting.id
            LEFT JOIN games_to_publishers ON games.id = games_to_publishers.game_id
            LEFT JOIN companies publishers ON games_to_publishers.company_id = publishers.id"
    ];
}

/** Returns SQL fragments for joining and aggregating engines.
 */
function getEngineStatements(): array
{
    return [
        'json' => "
            IF(COUNT(DISTINCT engines.id) = 0, '',
                JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                'id', engines.id, 
                'name', engines.name))
            )
            AS engines",
        'join' => "
            LEFT JOIN games_to_engines ON games.id = games_to_engines.game_id
            LEFT JOIN engines ON games_to_engines.engine_id = engines.id"
    ];
}

/** Returns SQL fragments for joining and aggregating series.
 */
function getSeriesStatements(): array
{
    return [
        'json' => "
            IF(COUNT(DISTINCT series.id) = 0, '',
                JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                'id', series.id, 
                'name', series.name))
            )
            AS series",
        'join' => "
            LEFT JOIN games_to_series ON games.id = games_to_series.game_id
            LEFT JOIN series ON games_to_series.series_id = series.id"
    ];
}

/** Returns SQL fragments for joining and aggregating franchises.
 */
function getFranchiseStatements(): array
{
    return [
        'json' => "
            IF(COUNT(DISTINCT franchises.id) = 0, '',
                JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                'id', franchises.id, 
                'name', franchises.name))
            )
            AS franchises",
        'join' => "
            LEFT JOIN games_to_franchises ON games.id = games_to_franchises.game_id
            LEFT JOIN franchises ON games_to_franchises.franchise_id = franchises.id"
    ];
}

/** Returns SQL fragments for joining and aggregating languages.
 */
function getLanguageStatements(): array
{
    return [
        'json' => "
           JSON_OBJECT(
                'audio', 
                    IF(COUNT(DISTINCT audio.id) = 0, 
                        NULL, 
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', audio.id,
                            'name', audio.name
                        ))
                    ),
                'subtitles', 
                    IF(COUNT(DISTINCT subtitles.id) = 0, 
                        NULL, 
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', subtitles.id,
                            'name', subtitles.name
                        ))
                    ),
                 'interface', 
                    IF(COUNT(DISTINCT interfaces.id) = 0, 
                        NULL, 
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', interfaces.id,
                            'name', interfaces.name
                        ))
                    )
            ) AS supported_languages",
        'join' => "
            LEFT JOIN games_to_audio ON games.id = games_to_audio.game_id
            LEFT JOIN languages audio ON games_to_audio.language_id = audio.id
            LEFT JOIN games_to_subtitles ON games.id = games_to_subtitles.game_id
            LEFT JOIN languages subtitles ON games_to_subtitles.language_id = subtitles.id
            LEFT JOIN games_to_interfaces ON games.id = games_to_interfaces.game_id
            LEFT JOIN languages interfaces ON games_to_interfaces.language_id = interfaces.id"
    ];
}

/** Returns SQL fragments for joining and aggregating age ratings.
 */
function getAgeRatingStatements(): array
{
    $contents = getAgeRatingContentStatements();
    return [
        'json' => "
            IF(COUNT(DISTINCT age_ratings.id) = 0,
                '',
                JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                    'id', age_ratings.id,
                    'rating', age_ratings.rating,
                    'system', 
                        IF(age_rating_systems.id IS NOT NULL,
                            JSON_OBJECT(
                                'id', age_rating_systems.id,
                                'name', age_rating_systems.name,
                                'country', age_rating_systems.country),
                            ''
                        ),
                    " . $contents['json'] . "
                ))
            )
            AS age_ratings",
        'join' => "
            LEFT JOIN age_ratings ON age_ratings.game_id = games.id
            LEFT JOIN age_rating_systems ON age_rating_systems.id = age_ratings.system_id"
            . $contents['join']
    ];
}
/** Returns SQL fragments for joining and aggregating age rating contents.
 */
function getAgeRatingContentStatements() {

    return [
        'json' => "
            'contents', age_rating_contents_agg.contents
        ",
        'join' => "
            LEFT JOIN (
                SELECT
                    age_ratings.id AS rating_id,
                    IF(COUNT(DISTINCT age_rating_contents.id) > 0,
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', age_rating_contents.id,
                            'description', age_rating_contents.description)),
                        NULL
                    ) AS contents
                FROM age_ratings
                LEFT JOIN age_ratings_to_contents ON age_ratings_to_contents.rating_id = age_ratings.id
                LEFT JOIN age_rating_contents ON age_rating_contents.id = age_ratings_to_contents.content_id
                GROUP BY age_ratings.id
            ) AS age_rating_contents_agg ON age_rating_contents_agg.rating_id = age_ratings.id
        "
    ];
}

/** Returns SQL fragments for joining and aggregating regional releases.
 */
function getRegionalReleaseStatements() {
    $platforms = getReleasePlatformStatements();
    $regions = getReleaseRegionStatements();
    return [
        'json' => "
            IF(COUNT(DISTINCT regional_releases.id) = 0, '',
                JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                    'id', regional_releases.id, 
                    'date', regional_releases.date,
                    'type',
                        IF(release_types.id IS NOT NULL,
                            JSON_OBJECT(
                                'id', release_types.id,
                                'name', release_types.name
                            ),
                            ''
                        ),
                    " . $platforms['json'] . "," . $regions['json'] . "
                ))
            )
            AS regional_releases",
        'join' => "
            LEFT JOIN regional_releases ON regional_releases.game_id = games.id
            LEFT JOIN release_types ON release_types.id = regional_releases.type_id
            " . $platforms['join'] . $regions['join']
    ];
}
/** Returns SQL fragments for joining and aggregating release platforms.
 */
function getReleasePlatformStatements()
{
    return [
        'json' => "
            'platforms', platforms_agg.platforms
        ",
        'join' => "
            LEFT JOIN (
                SELECT
                    regional_releases.id AS release_id,
                    IF(COUNT(DISTINCT platforms.id) > 0,
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', platforms.id,
                            'name', platforms.name,
                            'family', 
                                IF(platform_families.id IS NOT NULL, JSON_OBJECT(
                                    'id', platform_families.id,
                                    'name', platform_families.name),
                                NULL),
                            'generation', platforms.generation
                        )),
                        NULL
                    ) AS platforms
                FROM regional_releases
                LEFT JOIN regional_releases_to_platforms ON regional_releases_to_platforms.release_id = regional_releases.id
                LEFT JOIN platforms ON platforms.id = regional_releases_to_platforms.platform_id
                LEFT JOIN platform_families ON platform_families.id = platforms.family_id
                GROUP BY regional_releases.id
            )
            AS platforms_agg ON platforms_agg.release_id = regional_releases.id
        "
    ];
}
/** Returns SQL fragments for joining and aggregating release regions.
 */
function getReleaseRegionStatements()
{
    return [
        'json' => "
            'regions', regions_agg.regions
        ",
        'join' => "
            LEFT JOIN (
                SELECT
                    regional_releases.id AS release_id,
                    IF(COUNT(DISTINCT regions.id) > 0,
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', regions.id,
                            'name', regions.name
                        )),
                        NULL
                    ) AS regions
                FROM regional_releases
                LEFT JOIN regional_releases_to_regions ON regional_releases_to_regions.release_id = regional_releases.id
                LEFT JOIN regions ON regions.id = regional_releases_to_regions.region_id
                GROUP BY regional_releases.id
            )
            AS regions_agg ON regions_agg.release_id = regional_releases.id
        "
    ];
}

/** Returns SQL fragments for joining and aggregating media.
 */
function getMediaStatements(): array
{
    return [
        'json' => "
           JSON_OBJECT(
                'artworks', 
                    IF(COUNT(DISTINCT artworks.id) = 0, 
                        NULL, 
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', artworks.id,
                            'url', artworks.url
                        ))
                    ),
                'screenshots', 
                    IF(COUNT(DISTINCT screenshots.id) = 0, 
                        NULL, 
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', screenshots.id,
                            'url', screenshots.url
                        ))
                    ),
                 'videos', 
                    IF(COUNT(DISTINCT videos.id) = 0, 
                        NULL, 
                        JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                            'id', videos.id,
                            'url', videos.url
                        ))
                    )
            ) AS media",
        'join' => "
            LEFT JOIN games_to_artworks ON games.id = games_to_artworks.game_id
            LEFT JOIN artworks ON games_to_artworks.artwork_id = artworks.id
            LEFT JOIN games_to_screenshots ON games.id = games_to_screenshots.game_id
            LEFT JOIN screenshots ON games_to_screenshots.screenshot_id = screenshots.id
            LEFT JOIN games_to_videos ON games.id = games_to_videos.game_id
            LEFT JOIN videos ON games_to_videos.video_id = videos.id"
    ];
}

/** Returns SQL fragments for joining and aggregating websites.
 */
function getWebsiteStatements(): array
{
    return [
        'json' => "
            IF(COUNT(DISTINCT websites.id) = 0, '',
                JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                'id', websites.id, 
                'url', websites.url))
            )
            AS websites",
        'join' => "
            LEFT JOIN games_to_websites ON games.id = games_to_websites.game_id
            LEFT JOIN websites ON games_to_websites.website_id = websites.id"
    ];
}