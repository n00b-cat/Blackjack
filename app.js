const express = require('express');
const app = express();

// socket.io
const { createServer } = require('http');
const server = createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const port = 777;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const serverplayers = {};
let number = 1

io.on('connection', (socket) => {
    console.log('a user connected');

    serverplayers[socket.id] = {
        "name": "Player" + number++,
        "hand": [],
        "bet": 0,
        "chips": 500
    };

    io.emit('updatePlayers', serverplayers);

    socket.on('disconnect', () => {
        console.log(serverplayers[socket.id].name + ' disconnected');

        delete serverplayers[socket.id];
        io.emit('updatePlayers', serverplayers);
    });

    console.log(serverplayers);

    socket.on("bet", (betamount) => {
        if (serverplayers[socket.id].chips < betamount) {
            console.log("not enough chips");
        }
        else if (serverplayers[socket.id].bet > 0) {
            console.log("already placed a bet")
        }
        else if (gameongoing == true) {
            console.log("game already started")
        }
        else {
            serverplayers[socket.id].chips -= betamount;
            serverplayers[socket.id].bet = betamount;
        }
    });

    socket.on("action", (action) => {
        console.log(action);
    });
});


let tick = 0; // 50 ms
let servertime = 10; // 1 s

let gameongoing = false;
let serverturn = null;
let playersingame = {};
let x = 0;

setInterval(() => {
    Object.values(serverplayers).some(player => {
        if (player.bet > 0) {
            tick++;
            return true;
        }
        return false;
    });

    if (tick >= 20) {
        console.log(servertime)
        io.emit('update', { servertime, serverturn });
        servertime--;
        tick = 0;
        console.log(serverturn);
    }

    if (servertime < 0 && gameongoing == false) {
        x = 0;
        gameongoing = true;
        newdeck();
        card_shuffle();
        deal_cards();
    }

    if (servertime < 0 && gameongoing == true) {
        if (x < Object.keys(playersingame).length) {
            serverturn = playersingame[Object.keys(playersingame)[x]].name;
            x++;
            servertime = 5;
            tick = 0;
            console.log("Turn ended")
        } else {
            game_end()
            servertime = 10;
            tick = 0;
        }
    }

    io.emit('updatePlayers', serverplayers);

}, 50);


server.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
});

// Cards / deak / game
const suits = ["heart", "spade", "clower", "diamond"]
let deck = []

function newdeck() {
    deck = [];
    for (let type = 0; type < 4; type++) {
        let suit = suits[type]

        for (let i = 1; i <= 13; i++) {
            deck.push(
                { "suit": suit, "number": i }
            )
        }
    }
}

// Card shuffle
function card_shuffle() {
    for (let i = 0; i < deck.length; i++) {
        let random = Math.floor(Math.random() * deck.length)
        let temp = deck[i]
        deck[i] = deck[random]
        deck[random] = temp
    }
}

function deal_cards() {
    Object.entries(serverplayers).forEach(([id, player]) => {
        player.hand = [];

        if (player.bet > 0) {
            for (let i = 0; i < 2; i++) {
                player.hand.push(deck.pop());
            }
            playersingame[id] = player;
        }
    });
}

function game_end() {
    gameongoing = false;
    serverturn = null;

    Object.entries(playersingame).forEach(([id]) => {
        serverplayers[id].chips += serverplayers[id].bet * 2;
        serverplayers[id].bet = 0;
        serverplayers[id].hand = [];
    });

    playersingame = {};
    io.emit('update', { servertime, serverturn });

    console.log("game ended")
    console.log("serverplayers", serverplayers);
}