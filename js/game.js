// // Card distribution

// for (let i = 0; i < deck.length; i++) {
//     players[i % players.length].hand.push(deck[i])
// }

// // Card drawing

// for (let y = 0; y < players.length; y++) {
//     let playerhand = document.createElement("div")
//     playerhand.id = players[y].name
//     document.body.appendChild(playerhand)

//     for (let x = 0; x < players[y].hand.length; x++) {
//         let card = players[y].hand[x]
//         let createbutton = document.createElement("button")
//         createbutton.innerHTML = card
//         playerhand.appendChild(createbutton)
//     }
// }