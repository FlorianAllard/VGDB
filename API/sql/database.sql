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
  `game` int(11) NOT NULL,
  `system` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rating_game_id_system_id` (`rating`,`game`,`system`),
  KEY `rating` (`rating`),
  KEY `game` (`game`),
  KEY `system` (`system`),
  CONSTRAINT `age_ratings_ibfk_1` FOREIGN KEY (`game`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `age_ratings_ibfk_2` FOREIGN KEY (`system`) REFERENCES `age_rating_systems` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `age_ratings_to_contents`;
CREATE TABLE `age_ratings_to_contents` (
  `rating` int(11) NOT NULL,
  `content` int(11) NOT NULL,
  UNIQUE KEY `rating_id_content_id` (`rating`,`content`),
  KEY `rating_id` (`rating`),
  KEY `content_id` (`content`),
  CONSTRAINT `age_ratings_to_contents_ibfk_4` FOREIGN KEY (`content`) REFERENCES `age_rating_contents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `age_ratings_to_contents_ibfk_5` FOREIGN KEY (`rating`) REFERENCES `age_ratings` (`id`) ON DELETE CASCADE
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


DROP TABLE IF EXISTS `covers`;
CREATE TABLE `covers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game` int(11) NOT NULL,
  `hero` varchar(255) DEFAULT NULL,
  `landscape` varchar(255) DEFAULT NULL,
  `portrait` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_id` (`game`),
  CONSTRAINT `covers_ibfk_1` FOREIGN KEY (`game`) REFERENCES `games` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `engines`;
CREATE TABLE `engines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `franchises`;
CREATE TABLE `franchises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games`;
CREATE TABLE `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `officialReleaseDate` int(11) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `premise` text DEFAULT NULL,
  `createdAt` int(11) NOT NULL,
  `updatedAt` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `games_to_artworks`;
CREATE TABLE `games_to_artworks` (
  `game` int(11) NOT NULL,
  `artwork` int(11) NOT NULL,
  UNIQUE KEY `game_id_artwork_url` (`game`,`artwork`),
  KEY `game_id` (`game`),
  KEY `artwork` (`artwork`),
  CONSTRAINT `games_to_artworks_ibfk_3` FOREIGN KEY (`game`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_artworks_ibfk_4` FOREIGN KEY (`artwork`) REFERENCES `artworks` (`id`) ON DELETE CASCADE
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
  CONSTRAINT `games_to_engines_ibfk_2` FOREIGN KEY (`engine_id`) REFERENCES `engines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_franchises`;
CREATE TABLE `games_to_franchises` (
  `game_id` int(11) NOT NULL,
  `franchise_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_franchise_id` (`game_id`,`franchise_id`),
  KEY `franchise_id` (`franchise_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_franchises_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_franchises_ibfk_2` FOREIGN KEY (`franchise_id`) REFERENCES `franchises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_genres`;
CREATE TABLE `games_to_genres` (
  `game` int(11) NOT NULL,
  `genre` int(11) NOT NULL,
  UNIQUE KEY `game_id_genre_id` (`game`,`genre`),
  KEY `genre_id` (`genre`),
  KEY `game_id` (`game`),
  CONSTRAINT `games_to_genres_ibfk_1` FOREIGN KEY (`game`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_genres_ibfk_2` FOREIGN KEY (`genre`) REFERENCES `genres` (`id`) ON DELETE CASCADE
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
  CONSTRAINT `games_to_modes_ibfk_4` FOREIGN KEY (`mode_id`) REFERENCES `modes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_perspectives`;
CREATE TABLE `games_to_perspectives` (
  `game_id` int(11) NOT NULL,
  `perspective_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_perspective_id` (`game_id`,`perspective_id`),
  KEY `perspective_id` (`perspective_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_perspectives_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_perspectives_ibfk_2` FOREIGN KEY (`perspective_id`) REFERENCES `perspectives` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_platforms`;
CREATE TABLE `games_to_platforms` (
  `game` int(11) NOT NULL,
  `platform` int(11) NOT NULL,
  UNIQUE KEY `game_id_platform_id` (`game`,`platform`),
  KEY `game_id` (`game`),
  KEY `platform` (`platform`),
  CONSTRAINT `games_to_platforms_ibfk_1` FOREIGN KEY (`game`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_platforms_ibfk_2` FOREIGN KEY (`platform`) REFERENCES `platforms` (`id`) ON DELETE CASCADE
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
  `game` int(11) NOT NULL,
  `screenshot` int(11) NOT NULL,
  UNIQUE KEY `game_id_screenshot_id` (`game`,`screenshot`),
  KEY `screenshot` (`screenshot`),
  CONSTRAINT `games_to_screenshots_ibfk_1` FOREIGN KEY (`game`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_screenshots_ibfk_2` FOREIGN KEY (`screenshot`) REFERENCES `screenshots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_series`;
CREATE TABLE `games_to_series` (
  `game_id` int(11) NOT NULL,
  `series_id` int(11) NOT NULL,
  UNIQUE KEY `game_id_series_id` (`game_id`,`series_id`),
  KEY `series_id` (`series_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_series_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_series_ibfk_2` FOREIGN KEY (`series_id`) REFERENCES `series` (`id`) ON DELETE CASCADE
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
  CONSTRAINT `games_to_themes_ibfk_2` FOREIGN KEY (`theme_id`) REFERENCES `themes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_videos`;
CREATE TABLE `games_to_videos` (
  `game` int(11) NOT NULL AUTO_INCREMENT,
  `video` int(11) NOT NULL,
  UNIQUE KEY `game_id_video_id` (`game`,`video`),
  KEY `game_id` (`game`),
  KEY `video` (`video`),
  CONSTRAINT `games_to_videos_ibfk_1` FOREIGN KEY (`game`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_videos_ibfk_2` FOREIGN KEY (`video`) REFERENCES `videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_websites`;
CREATE TABLE `games_to_websites` (
  `game` int(11) NOT NULL,
  `website` int(11) NOT NULL,
  UNIQUE KEY `game_id_website_id` (`game`,`website`),
  KEY `website` (`website`),
  CONSTRAINT `games_to_websites_ibfk_1` FOREIGN KEY (`game`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_websites_ibfk_2` FOREIGN KEY (`website`) REFERENCES `websites` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `genres`;
CREATE TABLE `genres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `languages`;
CREATE TABLE `languages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `modes`;
CREATE TABLE `modes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `perspectives`;
CREATE TABLE `perspectives` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
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
  `game` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_id_date_type` (`game`,`date`,`type`),
  KEY `type` (`type`),
  CONSTRAINT `regional_releases_ibfk_1` FOREIGN KEY (`game`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `regional_releases_ibfk_2` FOREIGN KEY (`type`) REFERENCES `release_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `regional_releases_to_platforms`;
CREATE TABLE `regional_releases_to_platforms` (
  `release` int(11) NOT NULL,
  `platform` int(11) NOT NULL,
  UNIQUE KEY `release_id_platform_id` (`release`,`platform`),
  KEY `release_id` (`release`),
  KEY `platform` (`platform`),
  CONSTRAINT `regional_releases_to_platforms_ibfk_1` FOREIGN KEY (`release`) REFERENCES `regional_releases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `regional_releases_to_platforms_ibfk_2` FOREIGN KEY (`platform`) REFERENCES `platforms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `regional_releases_to_regions`;
CREATE TABLE `regional_releases_to_regions` (
  `release` int(11) NOT NULL,
  `region` int(11) NOT NULL,
  UNIQUE KEY `release_id_region_id` (`release`,`region`),
  KEY `release_id` (`release`),
  KEY `region` (`region`),
  CONSTRAINT `regional_releases_to_regions_ibfk_1` FOREIGN KEY (`release`) REFERENCES `regional_releases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `regional_releases_to_regions_ibfk_2` FOREIGN KEY (`region`) REFERENCES `regions` (`id`) ON DELETE CASCADE
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


DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `platform` int(11) NOT NULL,
  `rating` float NOT NULL,
  `content` text NOT NULL,
  `createdAt` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_id_user_id` (`game`,`user`),
  KEY `game_id` (`game`),
  KEY `user` (`user`),
  KEY `platform` (`platform`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`game`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`platform`) REFERENCES `platforms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `screenshots`;
CREATE TABLE `screenshots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_url` (`id`,`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `series`;
CREATE TABLE `series` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `themes`;
CREATE TABLE `themes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `times_to_beat`;
CREATE TABLE `times_to_beat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game` int(11) NOT NULL,
  `inputs` int(11) NOT NULL,
  `minimum` int(11) DEFAULT NULL,
  `normal` int(11) DEFAULT NULL,
  `completionist` int(11) DEFAULT NULL,
  `speedrun` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `game_id` (`game`),
  CONSTRAINT `times_to_beat_ibfk_1` FOREIGN KEY (`game`) REFERENCES `games` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(25) NOT NULL,
  `title` int(11) NOT NULL DEFAULT 6,
  `password` text NOT NULL,
  `createdAt` int(11) NOT NULL,
  `profilePicturePath` text NOT NULL,
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
  `name` text NOT NULL,
  `thumbnail` varchar(255) NOT NULL,
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


-- 2025-07-08 13:04:29 UTC
