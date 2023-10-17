"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const CardNotFoundError_1 = require("./errors/CardNotFoundError");
class Player {
    constructor(id) {
        this.id = id;
        this.cards = [];
        this.playedCards = [];
        this.points = 0;
    }
    getCards() {
        return this.cards;
    }
    addCards(cards) {
        this.cards = [...this.cards, ...cards];
    }
    playCard(playedCards) {
        this.cardsInPlay = this.cards.filter((card) => playedCards.includes(card.text));
        if (!this.cardsInPlay.length) {
            throw new CardNotFoundError_1.CardNotFoundError();
        }
        this.cards = this.cards.filter((card) => !playedCards.includes(card.text));
    }
    pickCard(text) {
        this.cardPick = text;
    }
    getCardPick() {
        return this.cardPick;
    }
    getCardsInPlay() {
        var _a;
        return (_a = this.cardsInPlay) === null || _a === void 0 ? void 0 : _a.map((card) => card.text);
    }
    clearCardsInPlay() {
        this.cardsInPlay = undefined;
    }
    getPoints() {
        return this.points;
    }
    addPoint() {
        this.points += 1;
    }
}
exports.Player = Player;
