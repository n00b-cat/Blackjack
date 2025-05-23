// Express
const express = require('express');
const app = express();

// Socket.io
const { createServer } = require('http');
const server = createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const port = 1234;

app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules'));

app.use(express.json());

// Bycrypt (Hashing passwords)
const bcrypt = require('bcrypt');

// Mariadb (DB)
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    database: 'Blackjack',
    user: 'blackjackuser',
    password: 'password',
    connectionLimit: 5
});

// Query function
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

// Login and Sign up
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await runQuery("SELECT * FROM Players WHERE Username = ?", [username])
    if (users.length > 0) {
        const match = await bcrypt.compare(password, users[0].Password);
        if (match) {
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
    const hashedPassword = await bcrypt.hash(password, 10);

    if (password == password2) {
        const data = await runQuery("SELECT * FROM Players WHERE Username = ?", [username])
        if (data.length > 0) {
            console.log("username taken")
            return res.json({ success: false, message: "username taken" });
        } else {
            sql = "INSERT INTO Players (Username, Password, Chips) VALUES (?, ?, ?)";
            await runQuery(sql, [username, hashedPassword, 500]);

            sql = "SELECT * FROM Players WHERE Username = ?";
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

// Leaderboard Stats
app.get("/leaderboard", async (req, res) => {
    const data = await runQuery("SELECT * FROM Players ORDER BY Chips DESC")
    return res.json(data)
});

// history Stats
app.post("/history", async (req, res) => {
    const DBPlayer = await loadPlayer(req.body.username);

    const data = await runQuery("SELECT * FROM Games WHERE PlayerID = ? ORDER BY Date DESC", [DBPlayer.ID])
    return res.json(data)
});

// Get DBPlayer from username
async function loadPlayer(username) {
    const players = await runQuery("SELECT * FROM Players WHERE Username = ?", [username])
    return players[0];
}

const splayer = {};

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
            splayer[socket.id].msg = "Not enough chips </br>"
        }
        else if (splayer[socket.id].bet > 0) {
            splayer[socket.id].msg = "Already placed a bet </br>"
        }
        else if (betamount < 0) {
            splayer[socket.id].msg = "Invalid amount </br>"
        }
        else if (gameongoing == true) {
            splayer[socket.id].msg = "Game already started </br>"
        }
        else if (betamount > 0) {
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
                p.total = countTotal(p.hand)
                if (p.total > 21) {
                    p.status = "busted"
                    servertime = 0
                } else {
                    servertime = 5
                }
            }
            else if (action == "stand") {
                p.msg = "stand </br>"
                servertime = 0
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

let servertime = 10;

let gameongoing = false;
let serverturn = null;
let playersingame = {};

let dealer = {
    "Hand": [],
    "Total": 0,
    "Status": "idle"
}

let x = 0;

setInterval(() => {
    io.emit('update', { servertime, serverturn });
    io.emit('updatePlayers', splayer);

    Object.values(splayer).some(player => {
        if (player.bet > 0 && servertime > 0 || gameongoing == true && servertime > 0) {
            servertime--;
            return true;
        }
        return false;
    });

    Object.values(splayer).forEach(player => {
        player.total = countTotal(player.hand)
    });

    if (servertime <= 0 && gameongoing == false) {
        x = 0;
        gameongoing = true;
        newdeck();
        card_shuffle();
        deal_cards();
    }

    if (servertime <= 0 && gameongoing == true) {
        console.log(gameongoing)
        console.log("test")
        if (x < Object.keys(playersingame).length) {
            serverturn = playersingame[Object.keys(playersingame)[x]].name;
            x++;
            servertime = 5;
            console.log("Turn ended")
        } else if (dealer.Status != "idle") {
            game_end()
        } else {
            serverturn = "dealer"
            dealerturn()
        }
    }


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
            countTotal(player.hand)
            playersingame[id] = player;
        }
    });
    dealer.Hand.push(deck.pop())
    dealer.Hand.push(deck.pop())

    io.emit('dealercards', { dealerhand: [dealer.Hand[0]], dealertotal: Math.min(dealer.Hand[0].number, 10) });
    io.emit('update', { servertime, serverturn });
    io.emit('updatePlayers', splayer);
}

function countTotal(hand) {
    let total = 0;
    let aces = 0;
    for (let card of hand) {
        if (card.number === 1) {
            total += 11;
            aces++;
        } else {
            total += Math.min(card.number, 10);
        }
    }
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}

function dealerturn() {
    servertime = 2
    dealer.Total = countTotal(dealer.Hand);
    io.emit('dealercards', { dealerhand: dealer.Hand, dealertotal: dealer.Total });

    console.log("--- Dealers Turn ---")

    if (dealer.Total < 17) {
        console.log("new card")
        dealer.Hand.push(deck.pop());
    }
    else {
        if (dealer.Total > 21) {
            dealer.Status = "busted"
        } else {
            dealer.Status = "done"
        }
    }
}

function game_end() {
    servertime = 10
    gameongoing = false;
    serverturn = null;

    console.log("--- Players ---")
    console.log(splayer)
    console.log("-- Dealer ---")
    console.log(dealer)

    Object.entries(playersingame).forEach(async ([id]) => {
        let gameResult = null
        let gameBalance = 0

        const p = splayer[id];
        if (p.status == "playing") {
            if (p.total > dealer.Total || dealer.Status == "busted") {
                p.chips += p.bet * 2;
                p.msg = "You Won! :D"

                gameResult = "Won"
                gameBalance = "+" + p.bet

            } else if (p.total == dealer.total) {
                p.chips += p.bet
                p.msg = "Push"
                gameResult = "Push"
            }
            else {
                p.msg = "Dealer Wins :("
                gameResult = "Dealer won (Lost)"
                gameBalance = -p.bet
            }
        } else {
            p.msg = "You Busted! :("
            gameResult = "Busted (Lost)"
            gameBalance = -p.bet
        }
        p.bet = 0;
        p.hand = [];
        p.status = "idle"

        const DBPlayer = await loadPlayer(p.name);

        console.log(DBPlayer.ID)
        console.log(gameResult)
        console.log(gameBalance)

        // Logs the game
        sql = "INSERT INTO Games (PlayerID, Balance, Result) VALUES (?, ?, ?)";
        await runQuery(sql, [DBPlayer.ID, gameBalance, gameResult]);

        // update database
        await runQuery("update Players set Chips=? where Username=?", [p.chips, p.name]);
    });

    dealer.Status = "idle"
    dealer.Hand = [];
    playersingame = {};

    io.emit('dealercards', { dealerhand: dealer.Hand, dealertotal: dealer.Total })
    io.emit('update', { servertime, serverturn });
    io.emit('updatePlayers', splayer);

    console.log("--- Players ---")
    console.log(splayer)
    console.log("-- Dealer ---")
    console.log(dealer)
}