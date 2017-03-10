create database time_table;
use time_table;
CREATE TABLE IF NOT EXISTS `_SessionSqlStore` (
	`id` VARCHAR(300) NOT NULL PRIMARY KEY,
	`data` TEXT,
	`dtime` BIGINT
) ENGINE MyISAM DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

DROP TABLE `User`;
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
	`verified` SMALLINT,
	`subscribe` SMALLINT,
	`isAdmin` SMALLINT,
	PRIMARY KEY (`code`)
) ENGINE MyISAM DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

DROP TABLE `Class`;
CREATE TABLE IF NOT EXISTS `Class` (
    `location` VARCHAR(200),
	`code` BIGINT NOT NULL AUTO_INCREMENT,
	`address` NVARCHAR(200),
	`fee` DOUBLE,
	`classSize` INT,
	`datetime` VARCHAR(200),
	`registed` INT DEFAULT 0,
	PRIMARY KEY (`code`)
) ENGINE MyISAM DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

DROP TABLE `StudentClass`;
CREATE TABLE IF NOT EXISTS `StudentClass` (
	`code` BIGINT NOT NULL AUTO_INCREMENT,
	`classCode` BIGINT,
	`userCode` BIGINT,
	PRIMARY KEY (`code`),
	FOREIGN KEY (classCode) REFERENCES Class(code),
	FOREIGN KEY (userCode) REFERENCES User(code)
) ENGINE MyISAM DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

INSERT INTO User(email, first_name, last_name, subscribe, phone, password, verified, isAdmin) VALUES("van@mail.com", 'Van', "Phan", 0, '122', 'pppppp', 1, 1);

INSERT INTO User(email, first_name, last_name, subscribe, phone, password, verified, isAdmin) VALUES("van2@mail.com", 'Van', "Phan", 0, '122', 'pppppp', 1, 1);
