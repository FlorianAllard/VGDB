-- Adminer 5.3.0 MariaDB 11.7.2-MariaDB-ubu2404 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `age_ratings`;
CREATE TABLE `age_ratings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rating` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `system_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rating_game_id_system_id` (`rating`,`game_id`,`system_id`),
  KEY `game_id` (`game_id`),
  KEY `system_id` (`system_id`),
  KEY `rating` (`rating`),
  CONSTRAINT `age_ratings_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `age_ratings_ibfk_2` FOREIGN KEY (`system_id`) REFERENCES `age_rating_systems` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `age_ratings_to_contents`;
CREATE TABLE `age_ratings_to_contents` (
  `rating_id` int(11) NOT NULL,
  `content_id` int(11) NOT NULL,
  UNIQUE KEY `rating_id_content_id` (`rating_id`,`content_id`),
  KEY `rating_id` (`rating_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `age_ratings_to_contents_ibfk_4` FOREIGN KEY (`content_id`) REFERENCES `age_rating_contents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `age_ratings_to_contents_ibfk_5` FOREIGN KEY (`rating_id`) REFERENCES `age_ratings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `age_rating_contents`;
CREATE TABLE `age_rating_contents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `age_rating_systems`;
CREATE TABLE `age_rating_systems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `artworks`;
CREATE TABLE `artworks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_url` (`id`,`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games`;
CREATE TABLE `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `official_release_date` int(11) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `premise` text DEFAULT NULL,
  `createdAt` int(11) NOT NULL,
  `updatedAt` int(11) NOT NULL,
  `portrait` varchar(255) DEFAULT NULL,
  `landscape` varchar(255) DEFAULT NULL,
  `hero` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `games_to_artworks`;
CREATE TABLE `games_to_artworks` (
  `game_id` int(11) NOT NULL,
  `artwork_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_artwork_url` (`game_id`,`artwork_id`),
  KEY `game_id` (`game_id`),
  KEY `artwork_id` (`artwork_id`),
  CONSTRAINT `games_to_artworks_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_artworks_ibfk_2` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_audio`;
CREATE TABLE `games_to_audio` (
  `game_id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_language_id` (`game_id`,`language_id`),
  KEY `game_id` (`game_id`),
  KEY `language_id` (`language_id`),
  CONSTRAINT `games_to_audio_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_audio_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_developers`;
CREATE TABLE `games_to_developers` (
  `game_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_company_id` (`game_id`,`company_id`),
  KEY `company_id` (`company_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_developers_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_developers_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_engines`;
CREATE TABLE `games_to_engines` (
  `game_id` int(11) NOT NULL,
  `engine_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_engine_id` (`game_id`,`engine_id`),
  KEY `engine_id` (`engine_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_engines_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_engines_ibfk_2` FOREIGN KEY (`engine_id`) REFERENCES `game_engines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_franchises`;
CREATE TABLE `games_to_franchises` (
  `game_id` int(11) NOT NULL,
  `franchise_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_franchise_id` (`game_id`,`franchise_id`),
  KEY `franchise_id` (`franchise_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_franchises_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_franchises_ibfk_2` FOREIGN KEY (`franchise_id`) REFERENCES `game_franchises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_genres`;
CREATE TABLE `games_to_genres` (
  `game_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_genre_id` (`game_id`,`genre_id`),
  KEY `genre_id` (`genre_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_genres_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_x_genres_fk_2` FOREIGN KEY (`genre_id`) REFERENCES `game_genres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `games_to_interfaces`;
CREATE TABLE `games_to_interfaces` (
  `game_id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_language_id` (`game_id`,`language_id`),
  KEY `language_id` (`language_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_interfaces_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_interfaces_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_modes`;
CREATE TABLE `games_to_modes` (
  `game_id` int(11) NOT NULL,
  `mode_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_mode_id` (`game_id`,`mode_id`),
  KEY `mode_id` (`mode_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_modes_ibfk_3` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_modes_ibfk_4` FOREIGN KEY (`mode_id`) REFERENCES `game_modes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_perspectives`;
CREATE TABLE `games_to_perspectives` (
  `game_id` int(11) NOT NULL,
  `perspective_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_perspective_id` (`game_id`,`perspective_id`),
  KEY `perspective_id` (`perspective_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_perspectives_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_perspectives_ibfk_2` FOREIGN KEY (`perspective_id`) REFERENCES `game_perspectives` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_platforms`;
CREATE TABLE `games_to_platforms` (
  `game_id` int(11) NOT NULL,
  `platform_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_platform_id` (`game_id`,`platform_id`),
  KEY `platform_id` (`platform_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_platforms_ibfk_3` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_platforms_ibfk_4` FOREIGN KEY (`platform_id`) REFERENCES `platforms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_publishers`;
CREATE TABLE `games_to_publishers` (
  `game_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_company_id` (`game_id`,`company_id`),
  KEY `company_id` (`company_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_publishers_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_publishers_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_screenshots`;
CREATE TABLE `games_to_screenshots` (
  `game_id` int(11) NOT NULL,
  `screenshot_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_screenshot_id` (`game_id`,`screenshot_id`),
  KEY `screenshot_id` (`screenshot_id`),
  CONSTRAINT `games_to_screenshots_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_screenshots_ibfk_2` FOREIGN KEY (`screenshot_id`) REFERENCES `screenshots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_series`;
CREATE TABLE `games_to_series` (
  `game_id` int(11) NOT NULL,
  `series_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_series_id` (`game_id`,`series_id`),
  KEY `series_id` (`series_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_series_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_series_ibfk_2` FOREIGN KEY (`series_id`) REFERENCES `game_series` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_subtitles`;
CREATE TABLE `games_to_subtitles` (
  `game_id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_language_id` (`game_id`,`language_id`),
  KEY `language_id` (`language_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_subtitles_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_subtitles_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_supporting`;
CREATE TABLE `games_to_supporting` (
  `game_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_company_id` (`game_id`,`company_id`),
  KEY `company_id` (`company_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_supporting_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_supporting_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_themes`;
CREATE TABLE `games_to_themes` (
  `game_id` int(11) NOT NULL,
  `theme_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_theme_id` (`game_id`,`theme_id`),
  KEY `theme_id` (`theme_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_themes_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_themes_ibfk_2` FOREIGN KEY (`theme_id`) REFERENCES `game_themes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_videos`;
CREATE TABLE `games_to_videos` (
  `game_id` int(11) NOT NULL AUTO_INCREMENT,
  `video_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_video_id` (`game_id`,`video_id`),
  KEY `video_id` (`video_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_videos_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_videos_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_websites`;
CREATE TABLE `games_to_websites` (
  `game_id` int(11) NOT NULL,
  `website_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_website_id` (`game_id`,`website_id`),
  KEY `website_id` (`website_id`),
  CONSTRAINT `games_to_websites_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_websites_ibfk_2` FOREIGN KEY (`website_id`) REFERENCES `websites` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `game_engines`;
CREATE TABLE `game_engines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `game_franchises`;
CREATE TABLE `game_franchises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `game_genres`;
CREATE TABLE `game_genres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `game_modes`;
CREATE TABLE `game_modes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `game_perspectives`;
CREATE TABLE `game_perspectives` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `game_series`;
CREATE TABLE `game_series` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `game_themes`;
CREATE TABLE `game_themes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `languages`;
CREATE TABLE `languages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `platforms`;
CREATE TABLE `platforms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `family` int(11) DEFAULT NULL,
  `generation` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `family` (`family`),
  CONSTRAINT `platforms_ibfk_1` FOREIGN KEY (`family`) REFERENCES `platform_families` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `platform_families`;
CREATE TABLE `platform_families` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `regional_releases`;
CREATE TABLE `regional_releases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_id_date_type` (`game_id`,`date`,`type`),
  KEY `type` (`type`),
  CONSTRAINT `regional_releases_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `regional_releases_ibfk_3` FOREIGN KEY (`type`) REFERENCES `release_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `regional_releases_to_platforms`;
CREATE TABLE `regional_releases_to_platforms` (
  `release_id` int(11) NOT NULL,
  `platform_id` int(11) NOT NULL,
  UNIQUE KEY `release_id_platform_id` (`release_id`,`platform_id`),
  KEY `platform_id` (`platform_id`),
  KEY `release_id` (`release_id`),
  CONSTRAINT `regional_releases_to_platforms_ibfk_1` FOREIGN KEY (`release_id`) REFERENCES `regional_releases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `regional_releases_to_platforms_ibfk_2` FOREIGN KEY (`platform_id`) REFERENCES `platforms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `regional_releases_to_regions`;
CREATE TABLE `regional_releases_to_regions` (
  `release_id` int(11) NOT NULL,
  `region_id` int(11) NOT NULL,
  UNIQUE KEY `release_id_region_id` (`release_id`,`region_id`),
  KEY `region_id` (`region_id`),
  KEY `release_id` (`release_id`),
  CONSTRAINT `regional_releases_to_regions_ibfk_1` FOREIGN KEY (`release_id`) REFERENCES `regional_releases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `regional_releases_to_regions_ibfk_2` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `regions`;
CREATE TABLE `regions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `release_types`;
CREATE TABLE `release_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `screenshots`;
CREATE TABLE `screenshots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_url` (`id`,`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(25) NOT NULL,
  `title` int(11) NOT NULL DEFAULT 6,
  `password` text NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `profilePic` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `title` (`title`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`title`) REFERENCES `user_titles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `user_titles`;
CREATE TABLE `user_titles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `vgdb_authentification`;
CREATE TABLE `vgdb_authentification` (
  `token` varchar(255) NOT NULL,
  `createdAt` int(11) NOT NULL,
  `expiresIn` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `videos`;
CREATE TABLE `videos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_url` (`id`,`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `websites`;
CREATE TABLE `websites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2025-06-18 11:04:11 UTC
