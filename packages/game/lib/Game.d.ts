import { GameDeck } from "./GameDeck";
import { Player } from "./Player";
import { IGameConfig } from "./IGameConfig";
import { GameEvents } from "./GameEvents";
export declare class Game {
    private players;
    private readonly config;
    private deck;
    static readonly TIMER_BETWEEN_ROUNDS = 5000;
    static readonly MAX_CARDS = 10;
    static readonly MIN_PLAYERS = 2;
    private currentCzarId?;
    private nextCzarID?;
    private startTimer?;
    private roundTimer?;
    private pickTimer?;
    private round;
    private blackCard?;
    private lastEvent?;
    private eventEmitter;
    constructor(players: Array<Player>, config: IGameConfig, deck: GameDeck);
    on<T extends string = string, P = any>(event: T, cb: (payload: P) => void): void;
    getGameSummary(): {
        players: number;
        round: number;
        topScore: number;
    };
    getGameDetails(): {
        players: Record<string, any>[];
    };
    getLastevent(): GameEvents | undefined;
    getPlayers(): Player[];
    getRound(): number;
    getCardCar(): string | undefined;
    getNextCardCzar(): string | undefined;
    removePlayer(playerID: string): void;
    playCard(playerID: string, cards: string[]): void;
    pickCards(pickerID: string, cards: string[]): void;
    startRound(): void;
    private pickCardCzar;
    private prepareNextCardCzar;
    private handOutCards;
    private endPlay;
    private startPickTimer;
    private endPick;
    private endRoundPrematurely;
    private postRoundHandler;
    endGame(reason?: string): void;
    private cleanupTimers;
    private playerReachedMaxPoints;
    private allPlayersPlayedCards;
    private emit;
}
//# sourceMappingURL=Game.d.ts.map