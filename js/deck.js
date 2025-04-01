// Card creation
const suits = ["heart", "spade", "clower", "diamond"]
let deck = []

for (let type = 0; type < 4; type++) {
    let cardtype = suits[type]

    for (let i = 1; i <= 13; i++) {
        deck.push({ suit: cardtype, number: i })
    }
}