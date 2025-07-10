-- Adminer 5.3.0 MariaDB 11.7.2-MariaDB-ubu2404 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `AgeRatingContents`;
CREATE TABLE `AgeRatingContents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `AgeRatings`;
CREATE TABLE `AgeRatings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rating` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `system_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_id_system_id` (`game_id`,`system_id`),
  KEY `rating` (`rating`),
  KEY `system_id` (`system_id`),
  CONSTRAINT `AgeRatings_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `AgeRatings_ibfk_2` FOREIGN KEY (`system_id`) REFERENCES `AgeRatingSystems` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `AgeRatingSystems`;
CREATE TABLE `AgeRatingSystems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `AgeRatings_AgeRatingContents`;
CREATE TABLE `AgeRatings_AgeRatingContents` (
  `rating_id` int(11) NOT NULL,
  `content_id` int(11) NOT NULL,
  UNIQUE KEY `rating_id_content_id` (`rating_id`,`content_id`),
  KEY `rating_id` (`rating_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `AgeRatings_AgeRatingContents_ibfk_4` FOREIGN KEY (`content_id`) REFERENCES `AgeRatingContents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `AgeRatings_AgeRatingContents_ibfk_5` FOREIGN KEY (`rating_id`) REFERENCES `AgeRatings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Artworks`;
CREATE TABLE `Artworks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_url` (`id`,`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Companies`;
CREATE TABLE `Companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Covers`;
CREATE TABLE `Covers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `hero` varchar(255) DEFAULT NULL,
  `landscape` varchar(255) DEFAULT NULL,
  `portrait` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_id` (`game_id`),
  CONSTRAINT `Covers_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Engines`;
CREATE TABLE `Engines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Franchises`;
CREATE TABLE `Franchises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `GameModes`;
CREATE TABLE `GameModes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games`;
CREATE TABLE `Games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `officialReleaseDate` int(11) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `premise` text DEFAULT NULL,
  `createdAt` int(11) NOT NULL,
  `updatedAt` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `GameSeries`;
CREATE TABLE `GameSeries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Artworks`;
CREATE TABLE `Games_Artworks` (
  `game_id` int(11) NOT NULL,
  `artwork_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_artwork_url` (`game_id`,`artwork_id`),
  KEY `game_id` (`game_id`),
  KEY `artwork_id` (`artwork_id`),
  CONSTRAINT `Games_Artworks_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Artworks_ibfk_2` FOREIGN KEY (`artwork_id`) REFERENCES `Artworks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Developers`;
CREATE TABLE `Games_Developers` (
  `game_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_company_id` (`game_id`,`company_id`),
  KEY `game_id` (`game_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `Games_Developers_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Developers_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `Companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Dubbings`;
CREATE TABLE `Games_Dubbings` (
  `game_id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_language_id` (`game_id`,`language_id`),
  KEY `game_id` (`game_id`),
  KEY `language_id` (`language_id`),
  CONSTRAINT `Games_Dubbings_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Dubbings_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `Languages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Engines`;
CREATE TABLE `Games_Engines` (
  `game_id` int(11) NOT NULL,
  `engine_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_engine_id` (`game_id`,`engine_id`),
  KEY `game_id` (`game_id`),
  KEY `engine_id` (`engine_id`),
  CONSTRAINT `Games_Engines_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Engines_ibfk_2` FOREIGN KEY (`engine_id`) REFERENCES `Engines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Franchises`;
CREATE TABLE `Games_Franchises` (
  `game_id` int(11) NOT NULL,
  `franchise_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_franchise_id` (`game_id`,`franchise_id`),
  KEY `game_id` (`game_id`),
  KEY `franchise_id` (`franchise_id`),
  CONSTRAINT `Games_Franchises_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Franchises_ibfk_2` FOREIGN KEY (`franchise_id`) REFERENCES `Franchises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_GameModes`;
CREATE TABLE `Games_GameModes` (
  `game_id` int(11) NOT NULL,
  `mode_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_mode_id` (`game_id`,`mode_id`),
  KEY `game_id` (`game_id`),
  KEY `mode_id` (`mode_id`),
  CONSTRAINT `Games_GameModes_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_GameModes_ibfk_2` FOREIGN KEY (`mode_id`) REFERENCES `GameModes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_GameSeries`;
CREATE TABLE `Games_GameSeries` (
  `game_id` int(11) NOT NULL,
  `series_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_series_id` (`game_id`,`series_id`),
  KEY `game_id` (`game_id`),
  KEY `series_id` (`series_id`),
  CONSTRAINT `Games_GameSeries_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_GameSeries_ibfk_2` FOREIGN KEY (`series_id`) REFERENCES `GameSeries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Genres`;
CREATE TABLE `Games_Genres` (
  `game_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_genre_id` (`game_id`,`genre_id`),
  KEY `genre_id` (`genre_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `Games_Genres_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Genres_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `Genres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `Games_Platforms`;
CREATE TABLE `Games_Platforms` (
  `game_id` int(11) NOT NULL,
  `platform_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_platform_id` (`game_id`,`platform_id`),
  KEY `game_id` (`game_id`),
  KEY `platform_id` (`platform_id`),
  CONSTRAINT `Games_Platforms_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Platforms_ibfk_2` FOREIGN KEY (`platform_id`) REFERENCES `Platforms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_PlayerPerspectives`;
CREATE TABLE `Games_PlayerPerspectives` (
  `game_id` int(11) NOT NULL,
  `perspective_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_perspective_id` (`game_id`,`perspective_id`),
  KEY `game_id` (`game_id`),
  KEY `perspective_id` (`perspective_id`),
  CONSTRAINT `Games_PlayerPerspectives_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_PlayerPerspectives_ibfk_2` FOREIGN KEY (`perspective_id`) REFERENCES `PlayerPerspectives` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Publishers`;
CREATE TABLE `Games_Publishers` (
  `game_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_company_id` (`game_id`,`company_id`),
  KEY `game_id` (`game_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `Games_Publishers_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Publishers_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `Companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Screenshots`;
CREATE TABLE `Games_Screenshots` (
  `game_id` int(11) NOT NULL,
  `screenshot_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_screenshot_id` (`game_id`,`screenshot_id`),
  KEY `screenshot_id` (`screenshot_id`),
  CONSTRAINT `Games_Screenshots_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Screenshots_ibfk_2` FOREIGN KEY (`screenshot_id`) REFERENCES `Screenshots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Subtitles`;
CREATE TABLE `Games_Subtitles` (
  `game_id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_language_id` (`game_id`,`language_id`),
  KEY `game_id` (`game_id`),
  KEY `language_id` (`language_id`),
  CONSTRAINT `Games_Subtitles_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Subtitles_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `Languages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Themes`;
CREATE TABLE `Games_Themes` (
  `game_id` int(11) NOT NULL,
  `theme_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_theme_id` (`game_id`,`theme_id`),
  KEY `game_id` (`game_id`),
  KEY `theme_id` (`theme_id`),
  CONSTRAINT `Games_Themes_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Themes_ibfk_2` FOREIGN KEY (`theme_id`) REFERENCES `Themes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Translations`;
CREATE TABLE `Games_Translations` (
  `game_id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_language_id` (`game_id`,`language_id`),
  KEY `game_id` (`game_id`),
  KEY `language_id` (`language_id`),
  CONSTRAINT `Games_Translations_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Translations_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `Languages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Videos`;
CREATE TABLE `Games_Videos` (
  `game_id` int(11) NOT NULL,
  `video_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_video_id` (`game_id`,`video_id`),
  KEY `game_id` (`game_id`),
  KEY `video_id` (`video_id`),
  CONSTRAINT `Games_Videos_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Videos_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `Videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Games_Websites`;
CREATE TABLE `Games_Websites` (
  `game_id` int(11) NOT NULL,
  `website_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_website_id` (`game_id`,`website_id`),
  KEY `website_id` (`website_id`),
  CONSTRAINT `Games_Websites_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Games_Websites_ibfk_2` FOREIGN KEY (`website_id`) REFERENCES `Websites` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Genres`;
CREATE TABLE `Genres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `Languages`;
CREATE TABLE `Languages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `PlatformFamilies`;
CREATE TABLE `PlatformFamilies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `Platforms`;
CREATE TABLE `Platforms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `family_id` int(11) DEFAULT NULL,
  `generation` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `family` (`family_id`),
  CONSTRAINT `Platforms_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `PlatformFamilies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `PlayerPerspectives`;
CREATE TABLE `PlayerPerspectives` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `RegionalReleases`;
CREATE TABLE `RegionalReleases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_id_date_type` (`game_id`,`date`,`type_id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `RegionalReleases_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `RegionalReleases_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `ReleaseTypes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `RegionalReleases_Platforms`;
CREATE TABLE `RegionalReleases_Platforms` (
  `release_id` int(11) NOT NULL,
  `platform_id` int(11) NOT NULL,
  UNIQUE KEY `release_id_platform_id` (`release_id`,`platform_id`),
  KEY `release_id` (`release_id`),
  KEY `platform_id` (`platform_id`),
  CONSTRAINT `RegionalReleases_Platforms_ibfk_1` FOREIGN KEY (`release_id`) REFERENCES `RegionalReleases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `RegionalReleases_Platforms_ibfk_2` FOREIGN KEY (`platform_id`) REFERENCES `Platforms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `RegionalReleases_Regions`;
CREATE TABLE `RegionalReleases_Regions` (
  `release_id` int(11) NOT NULL,
  `region_id` int(11) NOT NULL,
  UNIQUE KEY `release_id_region_id` (`release_id`,`region_id`),
  KEY `release_id` (`release_id`),
  KEY `region_id` (`region_id`),
  CONSTRAINT `RegionalReleases_Regions_ibfk_1` FOREIGN KEY (`release_id`) REFERENCES `RegionalReleases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `RegionalReleases_Regions_ibfk_2` FOREIGN KEY (`region_id`) REFERENCES `Regions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Regions`;
CREATE TABLE `Regions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `ReleaseTypes`;
CREATE TABLE `ReleaseTypes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Reviews`;
CREATE TABLE `Reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `platform_id` int(11) NOT NULL,
  `rating` float NOT NULL,
  `content` text NOT NULL,
  `createdAt` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_id_user_id` (`game_id`,`user_id`),
  KEY `game_id` (`game_id`),
  KEY `user_id` (`user_id`),
  KEY `platform_id` (`platform_id`),
  CONSTRAINT `Reviews_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Reviews_ibfk_3` FOREIGN KEY (`platform_id`) REFERENCES `Platforms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Screenshots`;
CREATE TABLE `Screenshots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_url` (`id`,`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Themes`;
CREATE TABLE `Themes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `TimesToBeat`;
CREATE TABLE `TimesToBeat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `inputs` int(11) NOT NULL,
  `minimum` int(11) DEFAULT NULL,
  `normal` int(11) DEFAULT NULL,
  `completionist` int(11) DEFAULT NULL,
  `speedrun` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_id` (`game_id`),
  CONSTRAINT `TimesToBeat_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `Games` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(25) NOT NULL,
  `title_id` int(11) NOT NULL DEFAULT 6,
  `password` text NOT NULL,
  `createdAt` int(11) NOT NULL,
  `profilePicturePath` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `title_id` (`title_id`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`title_id`) REFERENCES `UserTitles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `UserTitles`;
CREATE TABLE `UserTitles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Videos`;
CREATE TABLE `Videos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `thumbnail` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_url` (`id`,`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `Websites`;
CREATE TABLE `Websites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `_IgdbAuthentification`;
CREATE TABLE `_IgdbAuthentification` (
  `token` varchar(255) NOT NULL,
  `createdAt` int(11) NOT NULL,
  `expiresIn` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `_IgdbAuthentification` (`token`, `createdAt`, `expiresIn`) VALUES
('79dcdsnrpj94pr2jhyyqy5tl3diqv5',	1752064488,	5517148);

-- 2025-07-09 12:44:33 UTC
