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
}

// player table
class player {
    constructor({ name, hand = [], chips, bet, msg, status, total }) {
        this.name = name;
        this.hand = hand;
        this.chips = chips;
        this.bet = bet;
        this.msg = msg;
        this.status = status;
        this.total = total;
    }
}