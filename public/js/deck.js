// Card creation
const suits = ["heart", "spade", "clower", "diamond"]
let deck = []

class Card {
    constructor(suit, number, x, y) {
        this.suit = suit;
        this.number = number;
        this.x = x;
        this.y = y;
        this.width = 55;
        this.height = 76;
        this.image = new Image();
        this.image.src = "sprites/" + this.suit + ".png";
        this.image.onload = () => { }
    }

    draw(ctx) {
        ctx.drawImage(this.image, (this.number - 1) * 55 + (this.number - 1), 0, this.width, this.height, this.x, this.y, this.width, this.height);
    }

    clickcard(xmouse, ymouse, playerhand) {
        if (xmouse > this.x && xmouse < this.x + this.width && ymouse > this.y && ymouse < this.y + this.height) {
            const index = playerhand.indexOf(this);

            if (table.length > 0) {
                if (table.slice(-1)[0].number <= this.number) {
                    placedcard(this, index);
                }
            }
            else {
                placedcard(this, index);
            }
        }
    }
}

for (let type = 0; type < 4; type++) {
    let suit = suits[type]

    for (let i = 1; i <= 13; i++) {
        deck.push(new Card(suit, i))
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