Create Database Blackjack;

CREATE USER 'blackjackuser'@localhost IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON Blackjack.* TO 'blackjackuser'@localhost;

Use Blackjack;

CREATE TABLE Players (
  ID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
  Username varchar(255) NOT NULL,
  Password varchar(255) NOT NULL,
  Chips int
);

Create TABLE Games (
  ID int PRIMARY KEY AUTO_INCREMENT,
  PlayerID int,
  Balance int,
  Result varchar(255),
  Date datetime DEFAULT current_timestamp(),
  FOREIGN KEY (PlayerID) REFERENCES Players (ID) ON DELETE CASCADE
);

--- History / games ---
-- Date (so many days ago) -- Result = color and Result text -- Balance change +- --