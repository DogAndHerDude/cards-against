"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const events_1 = require("events");
const class_transformer_1 = require("class-transformer");
const GameEvents_1 = require("./GameEvents");
const TooFewPlayersError_1 = require("./errors/TooFewPlayersError");
const PlayerDoesNotExistError_1 = require("./errors/PlayerDoesNotExistError");
class Game {
    constructor(players, config, deck) {
        this.players = players;
        this.config = config;
        this.deck = deck;
        this.round = 0;
        this.eventEmitter = new events_1.EventEmitter();
        if (players.length < Game.MIN_PLAYERS) {
            throw new TooFewPlayersError_1.TooFewPlayersError(players.length, Game.MIN_PLAYERS);
        }
    }
    // TODO: Need to get game state when joining a game in progress
    on(event, cb) {
        this.eventEmitter.on(event, cb);
    }
    getGameSummary() {
        var _a, _b;
        // TODO: show card packs
        return {
            players: this.players.length,
            round: this.round,
            topScore: (_b = (_a = this.players
                .slice()
                .sort((a, b) => (a.getPoints() > b.getPoints() ? 1 : -1))
                .pop()) === null || _a === void 0 ? void 0 : _a.getPoints()) !== null && _b !== void 0 ? _b : 0,
        };
    }
    getGameDetails() {
        var _a, _b;
        return {
            players: (_b = (_a = this.players) === null || _a === void 0 ? void 0 : _a.map((player) => (0, class_transformer_1.instanceToPlain)(player))) !== null && _b !== void 0 ? _b : [],
        };
    }
    getLastevent() {
        return this.lastEvent;
    }
    getPlayers() {
        return this.players;
    }
    getRound() {
        return this.round;
    }
    getCardCar() {
        return this.currentCzarId;
    }
    getNextCardCzar() {
        return this.nextCzarID;
    }
    removePlayer(playerID) {
        this.players = this.players.filter((player) => player.id !== playerID);
        if (this.players.length < Game.MIN_PLAYERS) {
            // Perhaps let players know of the reason it ended
            this.endGame();
            return;
        }
        if (playerID === this.nextCzarID) {
            this.prepareNextCardCzar();
            return;
        }
        if (this.currentCzarId === playerID) {
            this.endRoundPrematurely();
        }
    }
    playCard(playerID, cards) {
        if (playerID === this.currentCzarId) {
            return;
        }
        const player = this.players.find(({ id }) => id === playerID);
        if (!player) {
            throw new PlayerDoesNotExistError_1.PlayerDoesNotExistError();
        }
        if (!this.blackCard) {
            throw new Error("PLACEHOLDER: No black card in play");
        }
        if (this.blackCard.pick > cards.length) {
            throw new Error("PLACEHOLDER: Too few cards played.");
        }
        player.playCard(cards);
        this.emit(GameEvents_1.GameEvents.PLAYER_CARD_PLAYED, {
            playerID,
        });
        if (this.allPlayersPlayedCards()) {
            this.endPlay();
        }
    }
    pickCards(pickerID, cards) {
        if (pickerID !== this.currentCzarId) {
            return;
        }
        const cardCzar = this.players.find(({ id }) => id === this.currentCzarId);
        const winningPlayer = this.players.find((player) => {
            var _a;
            return (((_a = player.getCardsInPlay()) === null || _a === void 0 ? void 0 : _a.filter((card) => cards.includes(card)).length) === cards.length);
        });
        cardCzar === null || cardCzar === void 0 ? void 0 : cardCzar.pickCard(cards);
        winningPlayer === null || winningPlayer === void 0 ? void 0 : winningPlayer.addPoint();
        this.endPick();
    }
    startRound() {
        if (!this.round) {
            this.emit(GameEvents_1.GameEvents.GAME_STARTED);
        }
        this.round += 1;
        this.blackCard = this.deck.getBlackCard();
        if (this.blackCard === undefined) {
            // Notify reason
            this.endGame();
            return;
        }
        this.pickCardCzar();
        // TODO: Need to pass amount of cards to hand out based on what the pick count is
        this.handOutCards();
        this.emit(GameEvents_1.GameEvents.ROUND_STARTED, {
            blackCard: this.blackCard,
            cardCzar: this.currentCzarId,
            roundTimer: this.config.roundTimer,
        });
        this.roundTimer = setTimeout(() => this.endPlay(), this.config.roundTimer);
    }
    pickCardCzar() {
        if (!this.nextCzarID) {
            this.currentCzarId = this.players[0].id;
            // Check if players available
            // If not, throw error
        }
        else {
            this.currentCzarId = this.nextCzarID;
        }
        this.prepareNextCardCzar();
    }
    prepareNextCardCzar() {
        const prevCardCzarIndex = this.players.findIndex(({ id }) => id === this.currentCzarId);
        const nextCzar = this.players[prevCardCzarIndex + 1];
        if (nextCzar) {
            this.nextCzarID = nextCzar.id;
        }
        else {
            this.nextCzarID = this.players[0].id;
        }
    }
    handOutCards() {
        this.players.forEach((player) => {
            const playerCards = player.getCards();
            const newCards = this.deck.getWhiteCards(Game.MAX_CARDS - playerCards.length);
            player.addCards(newCards);
        });
        this.emit(GameEvents_1.GameEvents.HAND_OUT_CARDS, this.players.reduce((accumulator, player) => {
            // Gives the whole set again, make sure to account for it on the client
            accumulator[player.id] = player.getCards();
            return accumulator;
        }, {}));
    }
    endPlay() {
        clearTimeout(this.roundTimer);
        const playedCards = this.players
            .filter(({ id }) => id !== this.currentCzarId)
            .map((player) => {
            return player.getCardsInPlay();
        })
            .filter(Boolean);
        if (!playedCards.length) {
            this.endRoundPrematurely("No cards played");
        }
        this.emit(GameEvents_1.GameEvents.PLAY_ENDED, {
            playedCards,
        });
        this.startPickTimer();
    }
    startPickTimer() {
        this.pickTimer = setTimeout(() => this.endPick, this.config.pickTimer);
        this.emit(GameEvents_1.GameEvents.PICK_STARTED, {
            pickTimer: this.config.pickTimer,
        });
    }
    endPick() {
        clearTimeout(this.pickTimer);
        this.postRoundHandler();
    }
    endRoundPrematurely(reason) {
        if (this.playerReachedMaxPoints()) {
            this.endGame();
            return;
        }
        this.players.forEach((player) => player.clearCardsInPlay());
        this.emit(GameEvents_1.GameEvents.ROUND_ENDED, {
            reason,
        });
        this.startTimer = setTimeout(() => this.startRound(), Game.TIMER_BETWEEN_ROUNDS);
    }
    postRoundHandler() {
        var _a, _b;
        const cardCzar = this.players.find(({ id }) => id === this.currentCzarId);
        // Czar possibly quit
        if (!cardCzar) {
            this.startTimer = setTimeout(() => this.startRound(), Game.TIMER_BETWEEN_ROUNDS);
            return;
        }
        const winningPlayer = this.players.find((player) => {
            var _a;
            const pick = cardCzar.getCardPick();
            return (((_a = player.getCardsInPlay()) === null || _a === void 0 ? void 0 : _a.filter((card) => pick === null || pick === void 0 ? void 0 : pick.includes(card)).length) === (pick === null || pick === void 0 ? void 0 : pick.length));
        });
        this.emit(GameEvents_1.GameEvents.PICK_ENDED, {
            playerID: (_a = winningPlayer === null || winningPlayer === void 0 ? void 0 : winningPlayer.id) !== null && _a !== void 0 ? _a : null,
            winningCard: (_b = winningPlayer === null || winningPlayer === void 0 ? void 0 : winningPlayer.getCardsInPlay()) !== null && _b !== void 0 ? _b : null,
        });
        if (this.playerReachedMaxPoints()) {
            this.endGame();
            return;
        }
        this.players.forEach((player) => player.clearCardsInPlay());
        this.emit(GameEvents_1.GameEvents.ROUND_ENDED);
        this.startTimer = setTimeout(() => this.startRound(), Game.TIMER_BETWEEN_ROUNDS);
    }
    endGame(reason) {
        this.cleanupTimers();
        this.emit(GameEvents_1.GameEvents.GAME_ENDED, {
            summary: this.getGameSummary(),
            reason,
        });
    }
    cleanupTimers() {
        clearTimeout(this.startTimer);
        clearTimeout(this.roundTimer);
        clearTimeout(this.pickTimer);
    }
    playerReachedMaxPoints() {
        return (this.players.find((player) => player.getPoints() === this.config.maxPoints) !== undefined);
    }
    allPlayersPlayedCards() {
        return (this.players
            .filter(({ id }) => id !== this.currentCzarId)
            .find((player) => !!player.getCardsInPlay()) !== undefined);
    }
    emit(event, data) {
        this.lastEvent = event;
        this.eventEmitter.emit(event, data);
    }
}
exports.Game = Game;
Game.TIMER_BETWEEN_ROUNDS = 5000;
Game.MAX_CARDS = 10;
Game.MIN_PLAYERS = 2;
