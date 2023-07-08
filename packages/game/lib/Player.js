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
    playCard(text) {
        const cards = this.cards.filter((card) => text.includes(card.text));
        if (!cards.length) {
            throw new CardNotFoundError_1.CardNotFoundError();
        }
        this.cardsInPlay = cards.map((card) => card.text);
    }
    pickCard(text) {
        this.cardPick = text;
    }
    getCardPick() {
        return this.cardPick;
    }
    getCardsInPlay() {
        return this.cardsInPlay;
    }
    clearCardsInPlay() {
        if (!this.cardsInPlay) {
            // TODO: throw error no card in play
        }
        // this.playedCards = [...this.playedCards, this.cardInPlay];
        this.cards = this.cards.filter((card) => { var _a; return (_a = this.cardsInPlay) === null || _a === void 0 ? void 0 : _a.includes(card.text); });
        this.cardsInPlay = undefined;
    }
    getPoints() {
        return this.points;
    }
    addPoint() {
        this.points += 1;
    }
    // TODO: Refactor this shit to instanceToPlain
    toPlain() {
        return {
            id: this.id,
            points: this.points,
        };
    }
}
exports.Player = Player;
