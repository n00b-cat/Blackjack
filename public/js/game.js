// player table

class player {
    constructor({ name, hand = [], chips, bet }) {
        this.name = name;
        this.hand = hand;
        this.chips = chips;
        this.bet = bet;
    }
}

let players = {};

const socket = io();

socket.on('updatePlayers', (serverplayers) => {
    for (const id in serverplayers) {
        const serverplayer = serverplayers[id];

        if (!players[id]) {
            players[id] = new player(
                { name: serverplayer.name, hand: serverplayer.hand, bet: serverplayer.bet, chips: serverplayer.chips }
            );
        }
        else { 
            players[id].bet = serverplayer.bet;
            players[id].chips = serverplayer.chips;
            players[id].hand = serverplayer.hand;
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

socket.on('update', (update) => {
    turn = update.serverturn;
    timer = update.servertime;
});

document.getElementById("bet").addEventListener("click", () => {
    if (!players[socket.id]) return;
    const bet = document.getElementById("amount").value;
    socket.emit("bet", bet)
});

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

const hit = document.getElementById("hit");
const stand = document.getElementById("stand");
const double = document.getElementById("double");
const split = document.getElementById("split");

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

    ctx.textAlign = "center";
    ctx.font = "18px Verdana";
    ctx.fillStyle = "white";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let yOffset = 50;
    for (const id in players) {
        const player = players[id];
        ctx.fillText(player.name, 60, yOffset);
        ctx.fillText("chips: " + player.chips, 60, yOffset + 25);
        ctx.fillText("bet: " + player.bet, 60, yOffset + 50);
        for (let x = 0; x < player.hand.length; x++) {
            let card = new Card(player.hand[x].suit, player.hand[x].number, 10 + x * 60, canvas.height - 140);
            card.x = 10 + x * 60;
            card.y = yOffset + card.height + 25;
            card.draw(ctx);
        }
        yOffset += 220;
    }

    if (turn == null) {
        ctx.fillText("Waiting for bets", canvas.width / 2, 25);
    } else {
        ctx.fillText(turn + "'s turn", canvas.width / 2, 25);
    }
    ctx.fillText("time left: " + timer, canvas.width / 2, 50);
}

// game loop / loop
function gameloop() {
    draw();
    window.requestAnimationFrame(gameloop);
}

gameloop();