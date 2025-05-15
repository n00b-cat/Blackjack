const express = require('express');
const app = express();

// socket.io
const { createServer } = require('http');
const server = createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const port = 1234;

app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules'));

app.use(express.json());

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const conn = await getTestData()
    let sql = "SELECT * FROM players WHERE Username = ?";
    let users = await conn.query(sql, [username]);

    if (users.length > 0) {
        if (username == users[0].Username && password == users[0].Password) {
            console.log("Sucsessfully login")
            return res.json({ success: true, user: users[0] });
        }
        else {
            console.log("Login failed")
            return res.json({ success: false, message: "Login failed" });
        }
    }
    else {
        console.log("User not found")
        return res.json({ success: false, message: "User not found" });
    }
});

app.post('/signup', async (req, res) => {
    const { username, password, password2 } = req.body;

    if (password == password2) {
        const conn = await getTestData()
        let sql = "SELECT * FROM players WHERE Username = ?";
        let data = await conn.query(sql, [username]);

        if (data.length > 0) {
            console.log("username taken")
            return res.json({ success: false, message: "username taken" });
        } else {
            sql = "INSERT INTO Players (Username, Password, Chips) VALUES (?, ?, ?)";
            await conn.query(sql, [username, password, 500]);

            sql = "SELECT * FROM players WHERE Username = ?";
            let data = await conn.query(sql, [username]);

            console.log("User created")
            return res.json({ success: true, user: data[0] });
        }
    }
    else {
        console.log("Passwords dont match")
        return res.json({ success: false, message: "Passwords dont match" });
    }
});

app.get("/leaderboard", async (req, res) => {
    const conn = await getTestData()
    const sql = "SELECT * FROM players ORDER BY Chips DESC";
    const data = await conn.query(sql);
    return res.json(data)
});

const mariadb = require('mariadb');
const { Console } = require('console');
const pool = mariadb.createPool({
    host: 'localhost',
    database: 'Blackjack',
    user: 'root',
    password: 'skibidi07',
    connectionLimit: 5
});

async function getTestData() {
    let conn;
    try {
        conn = await pool.getConnection();
        return await conn;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (conn) conn.end();
    }
}


const splayer = {};
let number = 1

io.on('connection', (socket) => {
    console.log('a user connected');

    splayer[socket.id] = {
        "name": "Player" + number++,
        "hand": [],
        "bet": 0,
        "status": "idle",
        "chips": 500,
        "msg": ""
    };

    io.emit('updatePlayers', splayer);

    socket.on('disconnect', () => {
        console.log(splayer[socket.id].name + ' disconnected');

        delete splayer[socket.id];
        io.emit('updatePlayers', splayer);
    });

    console.log(splayer);

    socket.on("bet", (betamount) => {
        if (splayer[socket.id].chips < betamount) {
            splayer[socket.id].msg = "not enough chips </br>"
        }
        else if (splayer[socket.id].bet > 0) {
            splayer[socket.id].msg = "already placed a bet </br>"
        }
        else if (gameongoing == true) {
            splayer[socket.id].msg = "game already started </br>"
        }
        else {
            splayer[socket.id].chips -= betamount;
            splayer[socket.id].bet = betamount;
            splayer[socket.id].status = "playing"
        }
    });

    socket.on("action", (action) => {
        if (serverturn != splayer[socket.id].name) {
            splayer[socket.id].msg = "Not your turn </br>"
        }
        else if (splayer[socket.id].status != "playing") {
            splayer[socket.id].msg = "You are busted or not playing </br>"
        }
        else if (splayer[socket.id].hand.length >= 5) {
            splayer[socket.id].msg = "You have the maximum amout of cards (5) </br>"
        }
        else {
            if (action == "hit") {
                splayer[socket.id].msg = "hit </br>"
                splayer[socket.id].hand.push(deck.pop());
                servertime = 5
            }
            else if (action == "stand") {
                splayer[socket.id].msg = "stand </br>"
                servertime = 1
            }
            else if (action == "double") {
                splayer[socket.id].msg = "double </br>"
                servertime = 5
            }
            else if (action == "split") {
                splayer[socket.id].msg = "split </br>"
                servertime = 5
            }
            else {
                splayer[socket.id].msg = "invalid action </br>"
            }

            let total = 0
            for (let i = 0; i < splayer[socket.id].hand.length; i++) {
                total += splayer[socket.id].hand[i].number
            }

            if (total > 21) {
                splayer[socket.id].status = "Busted"
            }
        }

        io.emit('updatePlayers', splayer);
    });
});

let servertime = 10;

let gameongoing = false;
let serverturn = null;
let playersingame = {};
let dealerhand = [];
let x = 0;

setInterval(() => {
    Object.values(splayer).some(player => {
        if (player.bet > 0 && servertime > 0) {
            servertime--;
            console.log(servertime)
            return true;
        }
        return false;
    });

    if (servertime <= 0 && gameongoing == false) {
        x = 0;
        gameongoing = true;
        newdeck();
        card_shuffle();
        deal_cards();
    }

    if (servertime <= 0 && gameongoing == true) {
        if (x < Object.keys(playersingame).length) {
            serverturn = playersingame[Object.keys(playersingame)[x]].name;
            x++;
            servertime = 5;
            console.log("Turn ended")
        } else {
            game_end()
            servertime = 10;
        }
    }

    io.emit('update', { servertime, serverturn });
    io.emit('updatePlayers', splayer);

}, 1000);


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
    Object.entries(splayer).forEach(([id, player]) => {

        if (player.bet > 0) {
            for (let i = 0; i < 2; i++) {
                player.hand.push(deck.pop());
            }
            playersingame[id] = player;
        }
    });
    dealerhand.push(deck.pop())
    dealerhand.push(deck.pop())

    io.emit('update', { servertime, serverturn, dealercard: [dealerhand[0]] });
}

function game_end() {
    gameongoing = false;
    serverturn = null;

    Object.entries(playersingame).forEach(([id]) => {
        if (splayer[id].status == "playing") {
            splayer[id].chips += splayer[id].bet * 2;
        }
        splayer[id].bet = 0;
        splayer[id].hand = [];
        splayer[id].status = "idle"

    });
    dealerhand = []
    playersingame = {};

    io.emit('update', { servertime, serverturn, dealercard: [dealerhand[0]] });

    console.log("game ended")
    console.log("serverplayers", splayer);
}