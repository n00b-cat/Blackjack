// 55x76

const suits = ["Heart", "Spade", "Clower", "Diamond"]
let deck = []
let table = []

let players = [
    {name: "Player1", hand: []}, 
    {name: "Player3", hand: []}, 
    {name: "Player2", hand: []}, 
    {name: "Player2", hand: []},
]

// Card creation

for (let type = 0; type < 4; type++) {
    let cardtype = suits[type]

    for (let i = 1; i <= 13; i++) {
        if (i === 1) {
            deck.push(cardtype + "A")
        }
        else if (i === 11) {
            deck.push(cardtype + "J")
        }
        else if (i === 12) {
            deck.push(cardtype + "Q")
        }
        else if (i === 13) {
            deck.push(cardtype + "K")
        }
        else {
            deck.push(cardtype + i)
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
    console.log(deck)
}
