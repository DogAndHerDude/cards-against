var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CardService, Game, GameDeck, GameEvents } from "../src";
import { GameRunnerTimeoutError } from "./GameRunnnerTimeoutError";
export class GameRunner {
    constructor(players, gameTimeout = 1000) {
        this.gameTimeout = gameTimeout;
        this.events = [];
        const cardService = new CardService();
        const deck = new GameDeck(cardService.getDeck(GameRunner.config.packs));
        this.playerStash = players;
        this.game = new Game(players, GameRunner.config, deck);
        this.originalTimerBetweenRounds = Game.TIMER_BETWEEN_ROUNDS;
        Game.TIMER_BETWEEN_ROUNDS = 1;
        this.listenEvents();
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate if in progress already
            return new Promise((resolve, reject) => {
                let timeout;
                this.game.startRound();
                this.game.on(GameEvents.GAME_ENDED, () => {
                    Game.TIMER_BETWEEN_ROUNDS = this.originalTimerBetweenRounds;
                    clearTimeout(timeout);
                    resolve(this.events);
                });
                timeout = setTimeout(() => {
                    Game.TIMER_BETWEEN_ROUNDS = this.originalTimerBetweenRounds;
                    reject(new GameRunnerTimeoutError(this.gameTimeout, this.events));
                }, this.gameTimeout);
            });
        });
    }
    onRoundStarted(cb) {
        this.game.on(GameEvents.ROUND_STARTED, (data) => {
            cb(data, this.playerStash, this.events);
        });
    }
    onPickStarted(cb) {
        this.game.on(GameEvents.PICK_STARTED, (data) => {
            cb(data, this.playerStash, this.events);
        });
    }
    listenEvents() {
        Object.keys(GameEvents).forEach((event) => this.onEvent(event));
    }
    onEvent(event) {
        this.game.on(event, (data) => {
            this.events.push({
                event,
                data,
            });
        });
    }
}
GameRunner.config = {
    pickTimer: 100,
    roundTimer: 100,
    maxPoints: 2,
    packs: [0],
    maxPlayers: 6,
};
