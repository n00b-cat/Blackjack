# Blackjack made with node.js
This is a multiplayer blackjack game made where the website can be hosted on a computer and players can connect and play together.

## Features
**Multiplayer support:** Players can connect to the server and play together

**Real-time updates:**
Using node.js and websockets to get real-time updates for all players.

## Installation
To run this project you need the following installed:

**Mariadb**

```https://mariadb.com/downloads/```

Note: Working password and username for mariadb needs to match the one in app.js. (const pool)

**Nodejs**

```https://nodejs.org/en/download```

## Dependencies
Dependencies used in this project.
```sh
npm install express
npm install mariadb
npm install socket.io
```

## How to play blackjack
### Start
In blackjack start by the players placing bets, after bets are placed the dealer start dealing cards around the table until all players inculding the dealer has 2 cards. All player cards are faceup, while the first dealer card is shown but the seccond is facedown.

### Goal of the game
In blackjack you play aganist the dealer and not the other players, the goal of the game is to get a hand (all the cards you have) to be worth 21. If you have over 21 you "bust" meaning you lose automatically. 

### Cards
In blackjack cards have their numbers as their worth and, all cards without numbers (king, queen, jack) all count as 10. The A is a little more special as it can have the value of a 1 or 11. A hand with A and 5 would be a "soft" 16.

### Turns
Then one player at the time can decide what they want to do on their turn. there are 4 possible actions in blackjack you can do on your turn, "hit", "stand", "dobble" and "split"

**Hit:**
If the player "hit" they will be delt one more card, then they can decide their action again

**Stand:**
If the player "stands" they will end their turn.

**Dobble:**
If the player dobbles, they get one more card just like hit but they also dobble their original bet. but after they have dobbled their turn ends. meaning you cant hit anymore after a dobble.

**Split:**
Split the player can only do this if they have to identical cards in value. When splitting the players hand is divided into two SEPRART hands, on the new hand the player places a equal bet to the first hand. The hands gets delt one card each. The hands are player invidually where you cando your actions.

After all the players have done their turns the dealer flips his hidden card, and deppending on the value he hits or stands. if your hand is less then the dealers you lose, if the dealer has the same value you "push", meaning that the bet was refunded (tie). but if you have more then the dealer you win and dobble your bet.

### Blackjack
Blackjack is the best hand a player can get and its when a player gets 21 on their fist two cards. Blackjack grants a win over a normal 21 but pushes against dealer having blackjack. The payout for winning with a blackjack is 1 and a half times more than u bet or (3 to 2)
