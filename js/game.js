// player table

let players = [
    { name: "Player1", hand: [] },
    { name: "Player2", hand: [] },
    { name: "Player3", hand: [] },
    { name: "Player4", hand: [] },
]

// canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

    for (let player of players) {
        for (let card of player.hand) {
            card.clickcard(mouseX, mouseY);
        }
    }
});


// updating game
function update() {

}

// visualsing game fr
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < players.length; y++) {
        for (let x = 0; x < players[y].hand.length; x++) {
            let card = players[y].hand[x]
            card.x = 10 + x * 60;
            card.y = 10 + y * 100;
            card.draw(ctx);
        }
    }
}

// game loop / loop
function gameloop() {
    update();
    draw();
    window.requestAnimationFrame(gameloop);
}

gameloop();