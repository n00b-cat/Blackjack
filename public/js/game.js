// CCCOOONNNSSSTTT
const playerlist = document.getElementById("playerlist")
const turntext = document.getElementById("turntext")
const timertext = document.getElementById("timertext")
const hit = document.getElementById("hit");
const stand = document.getElementById("stand");
const double = document.getElementById("double");
const split = document.getElementById("split");
const info = document.getElementById("info")
const totalPlayer = document.getElementById("totalPlayer")
const totalDealer = document.getElementById("totalDealer")
const actionsinteractions = document.getElementById("actions")
const betcontainer = document.getElementById("BetContainer")
const betamount = betcontainer.querySelector("input")

let players = {};

const socket = io({ query: `username=${user.Username}` });

socket.on('updatePlayers', (serverplayers) => {
    for (const id in serverplayers) {
        const serverplayer = serverplayers[id];

        if (!players[id]) {
            players[id] = new player(
                { name: serverplayer.name, hand: serverplayer.hand, bet: serverplayer.bet, chips: serverplayer.chips, msg: serverplayer.msg, status: serverplayer.status, total: serverplayer.total }
            );
        }
        else {
            players[id].bet = serverplayer.bet;
            players[id].chips = serverplayer.chips;
            players[id].hand = serverplayer.hand;
            players[id].status = serverplayer.status;
            players[id].msg = serverplayer.msg;
            players[id].total = serverplayer.total;
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
let dealertotal = 0

socket.on('update', (update) => {
    turn = update.serverturn;
    timer = update.servertime;

    if (turn == null) {
        turntext.innerHTML = "Waiting for bets"
    } else {
        turntext.innerHTML = turn + "'s turn"
    }
    timertext.innerHTML = "time left: " + timer

    if (turn == null) {
        betcontainer.style.display = "block"
        actionsinteractions.style.display = "none"
    }
    else if (players[socket.id] && turn == players[socket.id].name) {
        betcontainer.style.display = "none"
        actionsinteractions.style.display = "block"
    }
    else {
        betcontainer.style.display = "none"
        actionsinteractions.style.display = "none"
    }
});

socket.on('dealercards', (update) => {
    dealerhand = update.dealerhand
    dealertotal = update.dealertotal
    totalDealer.innerHTML = dealertotal
})

betcontainer.querySelector("button").addEventListener("click", () => {
    if (!players[socket.id]) return;
    const bet = betamount.value;
    socket.emit("bet", bet)
});

// canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const devicepixelratio = window.devicePixelRatio || 1;

function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const cssWidth = container.clientWidth;
    const cssHeight = container.clientHeight;

    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    canvas.width = cssWidth * devicepixelratio;
    canvas.height = cssHeight * devicepixelratio;
    ctx.imageSmoothingEnabled = false;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

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

    totalPlayer.style.display = "none";
    totalDealer.style.display = "none";

    if (players[socket.id]) {
        let player = players[socket.id]
        
        info.innerHTML = player.msg;
        if (player.msg) {
            info.style.display = "block"
        } else {
            info.style.display = "none"
        }

        if (player.hand.length > 0) {
            for (let i = 0; i < player.hand.length; i++) {
                let card = new Card(player.hand[i].suit, player.hand[i].number, 1, 1);

                card.x = Math.round(canvas.width / 2) - Math.round((card.width) / 2) - Math.round(((player.hand.length - 1) * 24) / 2) + (i * 24);
                card.y = Math.round(canvas.height - 230);
                card.draw(ctx);
                totalPlayer.style.left = card.x + - 20 + "px"
            }
            totalPlayer.innerHTML = player.total
            totalPlayer.style.display = "block";
        }
    }

    if (dealerhand && dealerhand.length > 0) {
        for (let i = 0; i < dealerhand.length; i++) {
            let card = new Card(dealerhand[i].suit, dealerhand[i].number, 1, 1);

            card.x = Math.round(canvas.width / 2) - Math.round((card.width) / 2) - Math.round(((dealerhand.length - 1) * 24) / 2) + (i * 24);
            card.y = Math.round(canvas.height - 600);
            card.draw(ctx);
            totalDealer.style.left = card.x + - 20 + "px"
        }
        totalDealer.style.display = "block";
    }

    playerlist.innerHTML = ""

    for (const id in players) {
        const player = players[id];

        playerlist.innerHTML += "Name: " + player.name + "</br>";
        playerlist.innerHTML += "Chips: " + player.chips + "</br>";
        playerlist.innerHTML += "Bet: " + player.bet + "</br>";
        if (player.hand.length > 0) {
            playerlist.innerHTML += "Hand Total: " + player.total + "</br>";
        }

        if (player.hand)
            playerlist.innerHTML += "Status: " + player.status + "</br></br>";
    }
}

// game loop / loop
function gameloop() {
    draw();
    window.requestAnimationFrame(gameloop);
}

gameloop();