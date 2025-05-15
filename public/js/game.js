// player table
class player {
    constructor({ name, hand = [], chips, bet, msg, status }) {
        this.name = name;
        this.hand = hand;
        this.chips = chips;
        this.bet = bet;
        this.msg = msg;
        this.status = status;
    }
}
// CCCOOONNNSSSTTT
const playerlist = document.getElementById("playerlist")
const turntext = document.getElementById("turntext")
const timertext = document.getElementById("timertext")
const hit = document.getElementById("hit");
const stand = document.getElementById("stand");
const double = document.getElementById("double");
const split = document.getElementById("split");
const info = document.getElementById("info")
const totaltext = document.getElementById("totaltext")
const actionsinteractions = document.getElementById("actions")
const betcontainer = document.getElementById("BetContainer")
const betamount = betcontainer.querySelector("input")
const tutorial = document.getElementById("tutorial");

let players = {};

const socket = io();

socket.on('updatePlayers', (serverplayers) => {
    for (const id in serverplayers) {
        const serverplayer = serverplayers[id];

        if (!players[id]) {
            players[id] = new player(
                { name: serverplayer.name, hand: serverplayer.hand, bet: serverplayer.bet, chips: serverplayer.chips, msg: serverplayer.msg, status: serverplayer.status }
            );
        }
        else {
            players[id].bet = serverplayer.bet;
            players[id].chips = serverplayer.chips;
            players[id].hand = serverplayer.hand;
            players[id].status = serverplayer.status;
            players[id].msg = serverplayer.msg;
        }
    }

    for (const id in players) {
        if (!serverplayers[id]) {
            delete players[id];
        }
    }
});

let timer = "..."
let turn = null
let dealerhand = []

socket.on('update', (update) => {
    turn = update.serverturn;
    timer = update.servertime;
    dealerhand = update.dealercard
});


betcontainer.querySelector("button").addEventListener("click", () => {
    if (!players[socket.id]) return;
    const bet = betamount.value;
    socket.emit("bet", bet)
});


document.getElementById("help").addEventListener("click", () => {
    console.log("click")
    if (tutorial.style.display == "none") {
        tutorial.style.display = "block"
    } else {
        tutorial.style.display = "none"
    }
})

// canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const devicepixelratio = window.devicePixelRatio || 1;

canvas.width = innerWidth * devicepixelratio;
canvas.height = innerHeight * devicepixelratio;

window.addEventListener("resize", () => {
    canvas.width = innerWidth * devicepixelratio;
    canvas.height = innerHeight * devicepixelratio;
});

hit.addEventListener("click", () => {
    if (!turn || !players[socket.id]) return;
    socket.emit("action", "hit")
});

stand.addEventListener("click", () => {
    if (!turn || !players[socket.id]) return;
    socket.emit("action", "stand")
});

double.addEventListener("click", () => {
    if (!turn || !players[socket.id]) return;
    socket.emit("action", "double")
});

split.addEventListener("click", () => {
    if (!turn || !players[socket.id]) return;
    socket.emit("action", "split")
});

// visualsing game fr
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (players[socket.id]) {
        let player = players[socket.id]

        info.innerHTML = player.msg;

        totaltext.innerHTML = ""
        if (player.hand.length > 0) {
            let total = 0

            for (let i = 0; i < player.hand.length; i++) {
                let card = new Card(player.hand[i].suit, player.hand[i].number, 1, 1);

                card.x = (canvas.width / 2) - ((card.width) / 2) - (((player.hand.length - 1) * 12) / 2) + (i * 12);
                card.y = canvas.height - 230;
                card.draw(ctx);
                total += card.number
            }
            totaltext.innerHTML = "Total: " + total
        }
    }

    if (dealerhand) {
        for (let i = 0; i < dealerhand.length; i++) {
            let card = new Card(dealerhand[i].suit, dealerhand[i].number, 1, 1);

            card.x = (canvas.width / 2) - ((card.width * dealerhand.length) / 2) - (((dealerhand.length - 1) * 10) / 2) + (card.width * i) + (i * 10);
            card.y = canvas.height - 600;
            card.draw(ctx);
        }
    }

    if (turn == null) {
        betcontainer.style.display = "block"
        actionsinteractions.style.display = "none"
    }
    else if (turn == players[socket.id].name) {
        betcontainer.style.display = "none"
        actionsinteractions.style.display = "block"
    }
    else {
        betcontainer.style.display = "none"
        actionsinteractions.style.display = "none"
    }

    playerlist.innerHTML = ""

    for (const id in players) {
        const player = players[id];

        playerlist.innerHTML += "Name: " + player.name + "</br>";
        playerlist.innerHTML += "Chips: " + player.chips + "</br>";
        playerlist.innerHTML += "Bet: " + player.bet + "</br>";

        if (player.hand)

            playerlist.innerHTML += "Status: " + player.status + "</br></br>";
    }

    if (turn == null) {
        turntext.innerHTML = "Waiting for bets"
    } else {
        turntext.innerHTML = turn + "'s turn"
    }
    timertext.innerHTML = "time left: " + timer
}

// game loop / loop
function gameloop() {
    draw();
    window.requestAnimationFrame(gameloop);
}

gameloop();