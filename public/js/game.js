// player table

let players = {};
let turn = null

class player {
    constructor({name, hand}) {
        this.name = name;
        this.hand = hand;
    }
}

const socket = io();

socket.on('updatePlayers', (serverplayers) => {
    console.log(serverplayers)
    for (const id in serverplayers) {
        const serverplayer = serverplayers[id];

        if (!players[id]) {
            players[id] = new player(
                {name: serverplayer.name, hand: serverplayer.hand});
        }
    }

    console.log(Object.keys(serverplayers).length)

    if (Object.keys(serverplayers).length > 3) {
        const firstPlayerId = Object.keys(players)[0];
        turn = players[firstPlayerId];
    }

    for (const id in players) {
        if (!serverplayers[id]) {
            delete players[id];
        }
    }
    console.log(players);
});


let table = []
let lastplaced = null

// canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 200;
canvas.height = window.innerHeight - 200;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth - 200;
    canvas.height = window.innerHeight - 200;
});

function placedcard(card, index) {
    console.log(players.indexOf(turn) + 1)
    turn = players[ + 1]
    console.log("played: " + card.suit + " " + card.number);
    table.push(card);
    player.hand.splice(index, 1);
}

// Card distribution
function deal_cards() {
    players.forEach(player => {
        player.hand = []
    })

    for (let i = 0; i < deck.length; i++) {
        players[i % players.length].hand.push(deck[i])
    }
}

canvas.addEventListener("click", (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    for (let card of player.hand) {
        card.clickcard(mouseX, mouseY, player.hand, turn);
    }
});

// updating game
function update() {
}

// visualsing game fr
function draw() {

    ctx.textAlign = "center";
    ctx.font = "18px Verdana";
    ctx.fillStyle = "white";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let yOffset = 80;
    for (const id in players) {
        const player = players[id];
        ctx.fillText(player.name, 60, yOffset);
        ctx.fillText("Cards: " + player.hand.length, 60, yOffset + 25);
        yOffset += 80;
    }

    // for (let y = 0; y < players.length; y++) {
    //     if (y === players.indexOf(player)) {
    //         for (let x = 0; x < players[y].hand.length; x++) {
    //             let card = players[y].hand[x]
    //             card.x = 10 + x * 60;
    //             card.y = canvas.height - 140;
    //             card.draw(ctx);
    //         }
    //     }
    // }
    if (turn) {
        ctx.fillText("Turn: " + turn.name, canvas.width / 2, 25);
    } else {
        ctx.fillText("waiting for game to start...", canvas.width / 2, 25);
    }


    if (table.length > 0) {
        let tablecard = new Card(table.slice(-1)[0].suit, table.slice(-1)[0].number, canvas.width / 2 - 27, canvas.height / 2 - 38);
        tablecard.draw(ctx);
    }
}

// game loop / loop
function gameloop() {
    update();
    draw();
    window.requestAnimationFrame(gameloop);
}

gameloop();