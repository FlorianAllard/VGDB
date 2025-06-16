-- Adminer 5.3.0 MariaDB 11.7.2-MariaDB-ubu2404 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `games`;
CREATE TABLE `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `official_release_date` datetime DEFAULT NULL,
  `summary` varchar(255) DEFAULT NULL,
  `premise` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `games_x_genres`;
CREATE TABLE `games_x_genres` (
  `game_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL,
  KEY `games_x_genres_fk_1` (`game_id`),
  KEY `games_x_genres_fk_2` (`genre_id`),
  CONSTRAINT `games_x_genres_fk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `games_x_genres_fk_2` FOREIGN KEY (`genre_id`) REFERENCES `game_genres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `game_genres`;
CREATE TABLE `game_genres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


DROP TABLE IF EXISTS `platforms`;
CREATE TABLE `platforms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `family` int(11) DEFAULT NULL,
  `generation` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `family` (`family`),
  CONSTRAINT `platforms_fk_1` FOREIGN KEY (`family`) REFERENCES `platform_families` (`id`) ON DELETE NO ACTION
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

INSERT INTO `users` (`id`, `email`, `username`, `title`, `password`, `createdAt`, `profilePic`) VALUES
(2,	'naru@vgdb.com',	'Naru',	6,	'$2y$10$dOYNKvPWdtlWKvltCWh39.eGArbN6gwnzMAe5KGkALCTq41WGjxme',	'2025-06-11 13:45:35',	'/Assets/Profiles/Naru.webp'),
(3,	'underbite@vgdb.com',	'Underbite',	6,	'$2y$10$nmhvIhYtMZo2f0mNNwLJw.zrt/AQdMsDjoTQuBS5VtwWe5MzydHkm',	'2025-06-11 13:46:13',	'/Assets/Profiles/Underbite.webp'),
(4,	'bacon@vgdb.com',	'Bacon',	6,	'$2y$10$9Wyf.sWASUJKF9Zg2vuh6eb6LvMj0ZDxvW3Mhghz4GxTjqPqc6bCO',	'2025-06-11 13:46:51',	'/Assets/Profiles/Bacon.webp'),
(7,	'admin@vgdb.com',	'Admin',	6,	'$2y$10$/LuiPssxjvMBWF7RawlVpeVDZPhrdj.AH6R4xqdk9upCauXBlDG2e',	'2025-06-12 13:27:37',	'/Assets/Profiles/Default.webp');

DROP TABLE IF EXISTS `user_titles`;
CREATE TABLE `user_titles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `user_titles` (`id`, `name`) VALUES
(6,	'Newbie'),
(7,	'Casual Player'),
(8,	'Achievement Hunter'),
(9,	'Speedrunner'),
(10,	'Completionist'),
(11,	'Lore Master'),
(12,	'Min-Maxer');

-- 2025-06-16 06:52:45 UTC
