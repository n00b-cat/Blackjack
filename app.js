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
    const users = await runQuery("SELECT * FROM players WHERE Username = ?", [username])
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
        const data = await runQuery("SELECT * FROM players WHERE Username = ?", [username])
        if (data.length > 0) {
            console.log("username taken")
            return res.json({ success: false, message: "username taken" });
        } else {
            sql = "INSERT INTO Players (Username, Password, Chips) VALUES (?, ?, ?)";
            await runQuery(sql, [username, password, 500]);

            sql = "SELECT * FROM players WHERE Username = ?";
            let data = await runQuery(sql, [username]);

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
    const data = await runQuery("SELECT * FROM players ORDER BY Chips DESC")
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

async function runQuery(sql, param) {
    let conn;
    try {
        conn = await pool.getConnection();
        return await conn.query(sql, param);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (conn) conn.end();
    }
}

async function loadPlayer(username) {
    const players = await runQuery("SELECT * FROM players WHERE Username = ?", [username])
    return players[0];
}

const splayer = {};
let number = 1

io.on('connection', async (socket) => {
    const username = socket.request._query['username']
    console.log(`${username} connected`);

    const player = await loadPlayer(username);

    splayer[socket.id] = {
        "name": player.Username,
        "hand": [],
        "bet": 0,
        "status": "idle",
        "chips": player.Chips,
        "msg": "",
        "total": 0
    };

    io.emit('updatePlayers', splayer);

    socket.on('disconnect', () => {
        console.log(splayer[socket.id].name + ' disconnected');

        delete splayer[socket.id];
        io.emit('updatePlayers', splayer);
    });

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
        const p = splayer[socket.id];
        if (serverturn != p.name) {
            p.msg = "Not your turn </br>"
        }
        else if (p.status != "playing") {
            p.msg = "You are busted or not playing </br>"
        }
        else if (p.hand.length >= 5) {
            p.msg = "You have the maximum amout of cards (5) </br>"
        }
        else {
            if (action == "hit") {
                p.msg = "hit </br>"
                p.hand.push(deck.pop());
                servertime = 5
                countcards(p)
                checkbusted(p)
            }
            else if (action == "stand") {
                p.msg = "stand </br>"
                servertime = 1
            }
            else if (action == "double") {
                p.msg = "double </br>"
                servertime = 5
            }
            else if (action == "split") {
                p.msg = "split </br>"
                servertime = 5
            }
            else {
                p.msg = "invalid action </br>"
            }
        }

        io.emit('updatePlayers', splayer);
    });
});

function countcards(player) {
    player.total = 0
    for (let i = 0; i < player.hand.length; i++) {
        player.total += player.hand[i].number == 1
            ? 11
            : Math.min(player.hand[i].number, 10);
    }
}

function checkbusted(player) {
    if (player.total > 21) {
        for (let i = 0; i < player.hand.length; i++) {
            const card = player.hand[i]
            if (card.number == 11) {
                card.number = 1
                player.total -= 10
            }
        }
        player.status = "Busted"
        servertime = 0;
    }
}

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
            countcards(player)
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

    Object.entries(playersingame).forEach(async ([id]) => {
        const p = splayer[id];
        if (p.status == "playing") {
            p.chips += p.bet * 2;
        }
        p.bet = 0;
        p.hand = [];
        p.status = "idle"

        // update database
        await runQuery("update Players set Chips=? where Username=?", [p.chips, p.name]);
    });
    dealerhand = []
    playersingame = {};

    io.emit('update', { servertime, serverturn, dealercard: [dealerhand[0]] });

    console.log("game ended")
    console.log("serverplayers", splayer);
}