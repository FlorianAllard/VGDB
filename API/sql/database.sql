-- Adminer 5.3.0 MariaDB 11.7.2-MariaDB-ubu2404 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `age_ratings`;
CREATE TABLE `age_ratings` (
  `rating` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `system_id` int(11) NOT NULL,
  PRIMARY KEY (`rating`),
  KEY `game_id` (`game_id`),
  KEY `system_id` (`system_id`),
  CONSTRAINT `age_ratings_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `age_ratings_ibfk_2` FOREIGN KEY (`system_id`) REFERENCES `age_rating_systems` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `age_ratings_to_contents`;
CREATE TABLE `age_ratings_to_contents` (
  `rating_id` int(11) NOT NULL,
  `content_id` int(11) NOT NULL,
  KEY `rating_id` (`rating_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `age_ratings_to_contents_ibfk_1` FOREIGN KEY (`rating_id`) REFERENCES `age_ratings` (`rating`) ON DELETE CASCADE,
  CONSTRAINT `age_ratings_to_contents_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `age_rating_contents` (`id`) ON DELETE CASCADE
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `games_to_audio`;
CREATE TABLE `games_to_audio` (
  `game_id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `language_id` (`language_id`),
  CONSTRAINT `games_to_audio_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_audio_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_developers`;
CREATE TABLE `games_to_developers` (
  `game_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `games_to_developers_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_developers_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_engines`;
CREATE TABLE `games_to_engines` (
  `game_id` int(11) NOT NULL,
  `engine_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `engine_id` (`engine_id`),
  CONSTRAINT `games_to_engines_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_engines_ibfk_2` FOREIGN KEY (`engine_id`) REFERENCES `game_engines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_franchises`;
CREATE TABLE `games_to_franchises` (
  `game_id` int(11) NOT NULL,
  `franchise_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `franchise_id` (`franchise_id`),
  CONSTRAINT `games_to_franchises_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_franchises_ibfk_2` FOREIGN KEY (`franchise_id`) REFERENCES `game_franchises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_genres`;
CREATE TABLE `games_to_genres` (
  `game_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL,
  KEY `games_x_genres_fk_2` (`genre_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `games_to_genres_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_x_genres_fk_2` FOREIGN KEY (`genre_id`) REFERENCES `game_genres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `games_to_interfaces`;
CREATE TABLE `games_to_interfaces` (
  `game_id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `language_id` (`language_id`),
  CONSTRAINT `games_to_interfaces_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_interfaces_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_modes`;
CREATE TABLE `games_to_modes` (
  `game_id` int(11) NOT NULL,
  `mode_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `mode_id` (`mode_id`),
  CONSTRAINT `games_to_modes_ibfk_3` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_modes_ibfk_4` FOREIGN KEY (`mode_id`) REFERENCES `game_modes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_perspectives`;
CREATE TABLE `games_to_perspectives` (
  `game_id` int(11) NOT NULL,
  `perspective_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `perspective_id` (`perspective_id`),
  CONSTRAINT `games_to_perspectives_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_perspectives_ibfk_2` FOREIGN KEY (`perspective_id`) REFERENCES `game_perspectives` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_platforms`;
CREATE TABLE `games_to_platforms` (
  `game_id` int(11) NOT NULL,
  `platform_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `platform_id` (`platform_id`),
  CONSTRAINT `games_to_platforms_ibfk_3` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_platforms_ibfk_4` FOREIGN KEY (`platform_id`) REFERENCES `platforms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_publishers`;
CREATE TABLE `games_to_publishers` (
  `game_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `games_to_publishers_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_publishers_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_series`;
CREATE TABLE `games_to_series` (
  `game_id` int(11) NOT NULL,
  `series_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `series_id` (`series_id`),
  CONSTRAINT `games_to_series_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_series_ibfk_2` FOREIGN KEY (`series_id`) REFERENCES `game_series` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_subtitles`;
CREATE TABLE `games_to_subtitles` (
  `game_id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `language_id` (`language_id`),
  CONSTRAINT `games_to_subtitles_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_subtitles_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_supporting`;
CREATE TABLE `games_to_supporting` (
  `game_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `games_to_supporting_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_supporting_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `games_to_themes`;
CREATE TABLE `games_to_themes` (
  `game_id` int(11) NOT NULL,
  `theme_id` int(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `theme_id` (`theme_id`),
  CONSTRAINT `games_to_themes_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_to_themes_ibfk_2` FOREIGN KEY (`theme_id`) REFERENCES `game_themes` (`id`) ON DELETE CASCADE
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


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


-- 2025-06-16 14:28:19 UTC
