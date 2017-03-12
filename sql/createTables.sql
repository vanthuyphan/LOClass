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
	`zip` VARCHAR(10),
	`LONumber` VARCHAR(30),
	`RENumber` VARCHAR(30),
	`verified` SMALLINT,
	`subscribe` SMALLINT,
	`isAdmin` SMALLINT,
	`note` VARCHAR(1000),
	`classRegistered` SMALLINT,
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
CREATE UNIQUE INDEX student_index ON StudentClass (classCode, userCode);

DROP TABLE `EmailHistory`;
CREATE TABLE IF NOT EXISTS `EmailHistory` (
	`code` BIGINT NOT NULL AUTO_INCREMENT,
	`created` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`to` NVARCHAR(500),
	`from` NVARCHAR(500),
	`subject` NVARCHAR(500),
	`content` NVARCHAR(4000),
	PRIMARY KEY (`code`)
) ENGINE MyISAM DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

INSERT INTO User(email, first_name, last_name, subscribe, phone, password, verified, isAdmin) VALUES("van@mail.com", 'Van', "Phan", 0, '122', 'pppppp', 1, 1);

INSERT INTO User(email, first_name, last_name, subscribe, phone, password, verified, isAdmin) VALUES("van2@mail.com", 'Van', "Phan", 0, '122', 'pppppp', 1, 1);
INSERT INTO User(email, first_name, last_name, subscribe, phone, password, verified, isAdmin) VALUES("thuan@loanfactory.com", 'Thuan', "Nguyen", 0, '122', 'Himark101', 1, 1);

INSERT INTO Class(location, address, fee, classSize, `datetime`, registed) VALUES("San Jose Office", '639 Tully Rd., Suite C, San Jose, CA 95111', 200, 15, 'April 1, 2017 It can be Mar 6-9 9AM-2PM PST (if more than 1 day) or Mar 6,7,9,11 9AM-2PM PST', 0);
INSERT INTO Class(location, address, fee, classSize, `datetime`, registed) VALUES("Orange County Office", '9523 Bolsa Ave., Westminster, CA 92683', 200, 10, 'April 22-23, 2017', 0);
INSERT INTO Class(location, address, fee, classSize, `datetime`, registed) VALUES("San Jose Office", '639 Tully Rd., Suite C, San Jose, CA 95111', 200, 15, 'May 6-7, 2017', 0);
INSERT INTO Class(location, address, fee, classSize, `datetime`, registed) VALUES("San Jose Office", '639 Tully Rd., Suite C, San Jose, CA 95111', 200, 15, 'May 27-28, 2017', 0);
INSERT INTO Class(location, address, fee, classSize, `datetime`, registed) VALUES("Seattle Office", '707 South Grady Way, Suite 600, Renton, WA 98057',  200, 15, 'June 3-4, 2017', 0);
INSERT INTO Class(location, address, fee, classSize, `datetime`, registed) VALUES("San Jose Office", '639 Tully Rd., Suite C, San Jose, CA 95111', 200, 15, 'June 10-11, 2017', 0);
INSERT INTO Class(location, address, fee, classSize, `datetime`, registed) VALUES("Minneapolis Office", '3015 85th Ave., N. Brooklyn Park, MN 55444', 200, 15, 'June 17-18, 2017', 0);
