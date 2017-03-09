create database time_table;
use time_table;
CREATE TABLE IF NOT EXISTS `_SessionSqlStore` (
	`id` VARCHAR(300) NOT NULL PRIMARY KEY,
	`data` TEXT,
	`dtime` BIGINT
) ENGINE MyISAM DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `User` (
	`code` BIGINT NOT NULL AUTO_INCREMENT,
	`id` VARCHAR(100) UNIQUE,
	`email` VARCHAR(100) UNIQUE,
	`first_name` VARCHAR(100),
	`last_name` VARCHAR(100),
	`middle_name` VARCHAR(100),
	`password` VARCHAR(20),
	`phone` VARCHAR(20),
	`street` VARCHAR(100),
	`zipcode` VARCHAR(10),
	`hasLOLicense` SMALLINT,
	`hasRELicense` SMALLINT,
	PRIMARY KEY (`code`)
) ENGINE MyISAM DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

DROP TABLE `Class`
CREATE TABLE IF NOT EXISTS `Class` (
    `location` VARCHAR(200),
	`code` BIGINT NOT NULL AUTO_INCREMENT,
	`address` NVARCHAR(200),
	`fee` DOUBLE,
	`classSize` INT,
	`datetime` VARCHAR(200),
	`registed` INT,
	PRIMARY KEY (`code`)
) ENGINE MyISAM DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE IF NOT EXISTS `ClassTime` (
	`code` BIGINT NOT NULL AUTO_INCREMENT,
	`classCode` BIGINT,
	`startTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`endTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`code`),
	FOREIGN KEY (classCode) REFERENCES Class(code)
) ENGINE MyISAM DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

INSERT INTO `User` VALUES (1, 'v4n', 'van@gmail.com', 'Van Phan', 'pppppp', '', 0);
INSERT INTO `User` VALUES (2, 'v5n', 'van1@gmail.com', 'Phan', 'pppppp', '', 0);
INSERT INTO `User` VALUES (3, 'v6n', 'van2@gmail.com', 'Van Phan', 'pppppp', '', 0);
INSERT INTO `User` VALUES (4, 'admin', 'admin@gmail.com', 'Admin', 'pppppp', '', 1);
