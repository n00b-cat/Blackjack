Create Database Blackjack;

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
  Date Date
)

--- History ---
-- Date (so many days ago) -- Result