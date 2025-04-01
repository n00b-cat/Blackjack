// player table

let players = [
    { name: "Player1", hand: [] },
    { name: "Player2", hand: [] },
    { name: "Player3", hand: [] },
    { name: "Player4", hand: [] },
    { name: "Player5", hand: [] },
]

// canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Card shuffle
function card_shuffle() {
    for (let i = 0; i < deck.length; i++) {
        let random = Math.floor(Math.random() * deck.length)
        let temp = deck[i]
        deck[i] = deck[random]
        deck[random] = temp
    }
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

// card size 55x76 1px gap

// updating game
function update() {

}
// visualsing game fr
function draw() {

    // clearing the screen from last frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Card drawing
    for (let y = 0; y < players.length; y++) {
        for (let x = 0; x < players[y].hand.length; x++) {
            let card = players[y].hand[x]

            let image = new Image();
            image.src = "sprites/" + card.suit + ".png";
            ctx.drawImage(image, (card.number - 1) * 55 + (card.number - 1), 0, 55, 76, x * 60, y * 80, 55, 76);
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