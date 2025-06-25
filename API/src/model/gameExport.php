<?php

require_once __DIR__ . '/../services/_debug.php';
require_once __DIR__ . '/../services/_pdo.php';
require_once __DIR__ . '/../services/_igdb.php';
require_once __DIR__ . '/../services/_utilities.php';

/**
 * Exports games with their related data.
 *
 * @param array $ids Array of game IDs to export.
 * @return array Exported games with related data.
 */
function exportGames(array $ids): array
{
    $pdo = pdoConnection();

    if (empty($ids)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $subqueries = getGameSubqueries();

    $sql = sprintf(
        "SELECT games.*,\n%s\n
        FROM games 
        WHERE games.id IN (%s)",
        implode(",\n", $subqueries),
        $placeholders
    );

    $stmt = $pdo->prepare($sql);
    $stmt->execute($ids);
    $games = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($games as $i => $game) {
        $games[$i] = decodeGameJsonFields($game);
    }

    return $games;
}

/**
 * Returns an array of SQL subqueries for related game entities.
 */
function getGameSubqueries(): array
{
    return [
        getGenreSubquery(),
        getPlatformSubquery(),
        getModeSubquery(),
        getPerspectiveSubquery(),
        getThemeSubquery(),
        getCompaniesSubquery(),
        getEngineSubquery(),
        getSeriesSubquery(),
        getFranchiseSubquery(),
        getLanguageSubquery(),
        getAgeRatingSubquery(),
        getRegionalReleaseSubquery(),
        getMediaSubquery(),
        getWebsiteSubquery(),
    ];
}

/**
 * Decodes JSON fields for a game row.
 */
function decodeGameJsonFields(array $game): array
{
    $jsonFields = [
        'genres', 'platforms', 'modes', 'perspectives', 'themes',
        'involved_companies', 'engines', 'series', 'franchises',
        'supported_languages', 'age_ratings', 'regional_releases',
        'media', 'websites'
    ];

    foreach ($jsonFields as $field) {
        $game[$field] = isset($game[$field]) ? json_decode($game[$field], true) : null;
    }

    // Nested decoding for age_ratings.system
    if (is_array($game['age_ratings'])) {
        foreach ($game['age_ratings'] as $key => $value) {
            $game['age_ratings'][$key]['system'] = isset($value['system'])
                ? json_decode($value['system'], true)
                : null;
        }
    }

    // Nested decoding for regional_releases.type
    if (is_array($game['regional_releases'])) {
        foreach ($game['regional_releases'] as $key => $value) {
            $game['regional_releases'][$key]['type'] = isset($value['type'])
                ? json_decode($value['type'], true)
                : null;
        }
    }

    return $game;
}

// --- Subquery Generators ---

function getGenreSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', genres.id,
                'name', genres.name
            )
        )
        FROM games_to_genres
        JOIN genres ON genres.id = games_to_genres.genre_id
        WHERE games_to_genres.game_id = games.id
    ) AS genres
    SQL;
}

function getPlatformSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', platforms.id,
                'name', platforms.name,
                'family', IF(
                    platform_families.id IS NOT NULL,
                    JSON_OBJECT(
                        'id', platform_families.id,
                        'name', platform_families.name
                    ),
                    NULL
                ),
                'generation', platforms.generation
            )
        )
        FROM games_to_platforms
        JOIN platforms ON games_to_platforms.platform_id = platforms.id
        LEFT JOIN platform_families ON platforms.family_id = platform_families.id
        WHERE games_to_platforms.game_id = games.id
    ) AS platforms
    SQL;
}

function getModeSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', modes.id,
                'name', modes.name
            )
        )
        FROM games_to_modes
        JOIN modes ON games_to_modes.mode_id = modes.id
        WHERE games_to_modes.game_id = games.id
    ) AS modes
    SQL;
}

function getPerspectiveSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_ARRAYAGG(
            DISTINCT JSON_OBJECT(
                'id', perspectives.id,
                'name', perspectives.name
            )
        )
        FROM games_to_perspectives
        JOIN perspectives ON games_to_perspectives.perspective_id = perspectives.id
        WHERE games_to_perspectives.game_id = games.id
    ) AS perspectives
    SQL;
}

function getThemeSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_ARRAYAGG(
            DISTINCT JSON_OBJECT(
                'id', themes.id,
                'name', themes.name
            )
        )
        FROM games_to_themes
        JOIN themes ON games_to_themes.theme_id = themes.id
        WHERE games_to_themes.game_id = games.id
    ) AS themes
    SQL;
}

function getCompaniesSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_OBJECT(
            'main_developers', IF(
                COUNT(DISTINCT developers.id) = 0, NULL,
                JSON_ARRAYAGG(
                    DISTINCT JSON_OBJECT(
                        'id', developers.id,
                        'name', developers.name
                    )
                )
            ),
            'supporting_developers', IF(
                COUNT(DISTINCT supporting.id) = 0, NULL,
                JSON_ARRAYAGG(
                    DISTINCT JSON_OBJECT(
                        'id', supporting.id,
                        'name', supporting.name
                    )
                )
            ),
            'publishers', IF(
                COUNT(DISTINCT publishers.id) = 0, NULL,
                JSON_ARRAYAGG(
                    DISTINCT JSON_OBJECT(
                        'id', publishers.id,
                        'name', publishers.name
                    )
                )
            )
        )
        FROM games_to_developers
        LEFT JOIN companies developers ON games_to_developers.company_id = developers.id AND games_to_developers.game_id = games.id
        LEFT JOIN games_to_supporting ON games_to_supporting.game_id = games.id
        LEFT JOIN companies supporting ON games_to_supporting.company_id = supporting.id
        LEFT JOIN games_to_publishers ON games_to_publishers.game_id = games.id
        LEFT JOIN companies publishers ON games_to_publishers.company_id = publishers.id
        WHERE games_to_developers.game_id = games.id
           OR games_to_supporting.game_id = games.id
           OR games_to_publishers.game_id = games.id
    ) AS involved_companies
    SQL;
}

function getEngineSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_ARRAYAGG(
            DISTINCT JSON_OBJECT(
                'id', engines.id,
                'name', engines.name
            )
        )
        FROM games_to_engines
        JOIN engines ON games_to_engines.engine_id = engines.id
        WHERE games_to_engines.game_id = games.id
    ) AS engines
    SQL;
}

function getSeriesSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_ARRAYAGG(
            DISTINCT JSON_OBJECT(
                'id', series.id,
                'name', series.name
            )
        )
        FROM games_to_series
        JOIN series ON games_to_series.series_id = series.id
        WHERE games_to_series.game_id = games.id
    ) AS series
    SQL;
}

function getFranchiseSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_ARRAYAGG(
            DISTINCT JSON_OBJECT(
                'id', franchises.id,
                'name', franchises.name
            )
        )
        FROM games_to_franchises
        JOIN franchises ON games_to_franchises.franchise_id = franchises.id
        WHERE games_to_franchises.game_id = games.id
    ) AS franchises
    SQL;
}

function getLanguageSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_OBJECT(
            'audio', IF(
                COUNT(DISTINCT audio.id) = 0, NULL,
                JSON_ARRAYAGG(
                    DISTINCT JSON_OBJECT(
                        'id', audio.id,
                        'name', audio.name
                    )
                )
            ),
            'subtitles', IF(
                COUNT(DISTINCT subtitles.id) = 0, NULL,
                JSON_ARRAYAGG(
                    DISTINCT JSON_OBJECT(
                        'id', subtitles.id,
                        'name', subtitles.name
                    )
                )
            ),
            'interface', IF(
                COUNT(DISTINCT interfaces.id) = 0, NULL,
                JSON_ARRAYAGG(
                    DISTINCT JSON_OBJECT(
                        'id', interfaces.id,
                        'name', interfaces.name
                    )
                )
            )
        )
        FROM games_to_audio
        LEFT JOIN languages audio ON games_to_audio.language_id = audio.id AND games_to_audio.game_id = games.id
        LEFT JOIN games_to_subtitles ON games_to_subtitles.game_id = games.id
        LEFT JOIN languages subtitles ON games_to_subtitles.language_id = subtitles.id
        LEFT JOIN games_to_interfaces ON games_to_interfaces.game_id = games.id
        LEFT JOIN languages interfaces ON games_to_interfaces.language_id = interfaces.id
        WHERE games_to_audio.game_id = games.id
           OR games_to_subtitles.game_id = games.id
           OR games_to_interfaces.game_id = games.id
    ) AS supported_languages
    SQL;
}

function getAgeRatingSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_ARRAYAGG(
            DISTINCT JSON_OBJECT(
                'id', age_ratings.id,
                'rating', age_ratings.rating,
                'system', IF(
                    age_rating_systems.id IS NOT NULL,
                    JSON_OBJECT(
                        'id', age_rating_systems.id,
                        'name', age_rating_systems.name,
                        'country', age_rating_systems.country
                    ),
                    ''
                ),
                'contents', (
                    SELECT IF(
                        COUNT(DISTINCT age_rating_contents.id) > 0,
                        JSON_ARRAYAGG(
                            DISTINCT JSON_OBJECT(
                                'id', age_rating_contents.id,
                                'description', age_rating_contents.description
                            )
                        ),
                        NULL
                    )
                    FROM age_ratings_to_contents
                    LEFT JOIN age_rating_contents ON age_rating_contents.id = age_ratings_to_contents.content_id
                    WHERE age_ratings_to_contents.rating_id = age_ratings.id
                )
            )
        )
        FROM age_ratings
        LEFT JOIN age_rating_systems ON age_rating_systems.id = age_ratings.system_id
        WHERE age_ratings.game_id = games.id
    ) AS age_ratings
    SQL;
}

function getRegionalReleaseSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_ARRAYAGG(
            DISTINCT JSON_OBJECT(
                'id', regional_releases.id,
                'date', regional_releases.date,
                'type', IF(
                    release_types.id IS NOT NULL,
                    JSON_OBJECT(
                        'id', release_types.id,
                        'name', release_types.name
                    ),
                    ''
                ),
                'platforms', (
                    SELECT IF(
                        COUNT(DISTINCT platforms.id) > 0,
                        JSON_ARRAYAGG(
                            DISTINCT JSON_OBJECT(
                                'id', platforms.id,
                                'name', platforms.name,
                                'family', IF(
                                    platform_families.id IS NOT NULL,
                                    JSON_OBJECT(
                                        'id', platform_families.id,
                                        'name', platform_families.name
                                    ),
                                    NULL
                                ),
                                'generation', platforms.generation
                            )
                        ),
                        NULL
                    )
                    FROM regional_releases_to_platforms
                    LEFT JOIN platforms ON platforms.id = regional_releases_to_platforms.platform_id
                    LEFT JOIN platform_families ON platform_families.id = platforms.family_id
                    WHERE regional_releases_to_platforms.release_id = regional_releases.id
                ),
                'regions', (
                    SELECT IF(
                        COUNT(DISTINCT regions.id) > 0,
                        JSON_ARRAYAGG(
                            DISTINCT JSON_OBJECT(
                                'id', regions.id,
                                'name', regions.name
                            )
                        ),
                        NULL
                    )
                    FROM regional_releases_to_regions
                    LEFT JOIN regions ON regions.id = regional_releases_to_regions.region_id
                    WHERE regional_releases_to_regions.release_id = regional_releases.id
                )
            )
        )
        FROM regional_releases
        LEFT JOIN release_types ON release_types.id = regional_releases.type_id
        WHERE regional_releases.game_id = games.id
    ) AS regional_releases
    SQL;
}

function getMediaSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_OBJECT(
            'artworks', IF(
                COUNT(DISTINCT artworks.id) = 0, NULL,
                JSON_ARRAYAGG(
                    DISTINCT JSON_OBJECT(
                        'id', artworks.id,
                        'url', artworks.url
                    )
                )
            ),
            'screenshots', IF(
                COUNT(DISTINCT screenshots.id) = 0, NULL,
                JSON_ARRAYAGG(
                    DISTINCT JSON_OBJECT(
                        'id', screenshots.id,
                        'url', screenshots.url
                    )
                )
            ),
            'videos', IF(
                COUNT(DISTINCT videos.id) = 0, NULL,
                JSON_ARRAYAGG(
                    DISTINCT JSON_OBJECT(
                        'id', videos.id,
                        'url', videos.url
                    )
                )
            )
        )
        FROM games_to_artworks
        LEFT JOIN artworks ON games_to_artworks.artwork_id = artworks.id AND games_to_artworks.game_id = games.id
        LEFT JOIN games_to_screenshots ON games_to_screenshots.game_id = games.id
        LEFT JOIN screenshots ON games_to_screenshots.screenshot_id = screenshots.id
        LEFT JOIN games_to_videos ON games_to_videos.game_id = games.id
        LEFT JOIN videos ON games_to_videos.video_id = videos.id
        WHERE games_to_artworks.game_id = games.id
           OR games_to_screenshots.game_id = games.id
           OR games_to_videos.game_id = games.id
    ) AS media
    SQL;
}

function getWebsiteSubquery(): string
{
    return <<<SQL
    (
        SELECT JSON_ARRAYAGG(
            DISTINCT JSON_OBJECT(
                'id', websites.id,
                'url', websites.url
            )
        )
        FROM games_to_websites
        JOIN websites ON games_to_websites.website_id = websites.id
        WHERE games_to_websites.game_id = games.id
    ) AS websites
    SQL;
}
