import { EventEmitter } from "events";
import { GameDeck } from "./GameDeck";
import { Player } from "./Player";
import { IGameConfig } from "./IGameConfig";
import { IGameSummary } from "./IGameSummary";
import { GameEvents } from "./GameEvents";
import { IGameDetails } from "./IGameDetails";
import { IRoundStartedPayload } from "./payloads/IRoundStartedPayload";
import { IHandoutCardsPayload } from "./payloads/IHandoutCardsPayload";
import { IRoundEndedPayload } from "./payloads/IRoundEndedPayload";
import { TooFewPlayersError } from "./errors/TooFewPlayersError";
import { PlayerDoesNotExistError } from "./errors/PlayerDoesNotExistError";

export class Game {
  public static readonly TIMER_BETWEEN_ROUNDS = 5000;
  public static readonly MAX_CARDS = 6;
  public static readonly MIN_PLAYERS = 2;

  private currentCzarId?: string;
  private nextCzarID?: string;
  private startTimer?: NodeJS.Timeout;
  private roundTimer?: NodeJS.Timeout;
  private pickTimer?: NodeJS.Timeout;
  private round = 0;
  private lastEvent?: GameEvents;

  private eventEmitter = new EventEmitter();

  constructor(
    private players: Array<Player>,
    private readonly config: IGameConfig,
    private deck: GameDeck
  ) {
    if (players.length < Game.MIN_PLAYERS) {
      throw new TooFewPlayersError(players.length, Game.MIN_PLAYERS);
    }
  }

  // TODO: Need to get game state when joining a game in progress

  public on<T extends string = string, P = any>(
    event: T,
    cb: (payload: P) => void
  ): void {
    this.eventEmitter.on(event, cb);
  }

  public getGameSummary(): IGameSummary {
    // TODO: show card packs
    return {
      players: this.players.length,
      round: this.round,
      topScore:
        this.players
          .slice()
          .sort((a, b) => (a.getPoints() > b.getPoints() ? 1 : -1))
          .pop()
          ?.getPoints() ?? 0,
    };
  }

  public getGameDetails(): IGameDetails {
    return {
      players: this.players?.map((player) => player.toPlain()) ?? [],
    };
  }

  public getLastevent(): GameEvents | undefined {
    return this.lastEvent;
  }

  public getPlayers(): Array<Player> {
    return this.players;
  }

  public getRound(): number {
    return this.round;
  }

  public getCardCar(): string | undefined {
    return this.currentCzarId;
  }

  public getNextCardCzar(): string | undefined {
    return this.nextCzarID;
  }

  public removePlayer(playerID: string): void {
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

  // TODO: refactor to take an array of cards
  public playCard(playerID: string, card: string): void {
    const player = this.players.find(({ id }) => id === playerID);

    if (player) {
      player?.playCard(card);

      this.emit(GameEvents.PLAYER_CARD_PLAYED, {
        playerID,
      });
    } else {
      throw new PlayerDoesNotExistError();
    }

    if (this.allPlayersPlayedCards()) {
      this.endPlay();
    }
  }

  public pickCard(pickerID: string, card: string): void {
    if (pickerID !== this.currentCzarId) {
      return;
    }

    const cardCzar = this.players.find(({ id }) => id === this.currentCzarId);
    const winningPlayer = this.players.find(
      (player) => player.getCardInPlay() === card
    );

    cardCzar?.pickCard(card);
    winningPlayer?.addPoint();
    this.endPick();
  }

  public startRound(): void {
    if (!this.round) {
      this.emit(GameEvents.GAME_STARTED);
    }

    this.round += 1;
    const blackCard = this.deck.getBlackCard();

    if (blackCard === undefined) {
      // Notify reason
      this.endGame();
      return;
    }

    this.pickCardCzar();
    // TODO: Need to pass amount of cards to hand out based on what the pick count is
    this.handOutCards();
    this.emit<IRoundStartedPayload>(GameEvents.ROUND_STARTED, {
      blackCard,
      cardCzar: this.currentCzarId as string,
      roundTimer: this.config.roundTimer,
    });
    this.roundTimer = setTimeout(() => this.endPlay(), this.config.roundTimer);
  }

  private pickCardCzar() {
    if (!this.nextCzarID) {
      this.currentCzarId = this.players[0].id;
      // Check if players available
      // If not, throw error
    } else {
      this.currentCzarId = this.nextCzarID;
    }

    this.prepareNextCardCzar();
  }

  private prepareNextCardCzar() {
    const prevCardCzarIndex = this.players.findIndex(
      ({ id }) => id === this.currentCzarId
    );
    const nextCzar = this.players[prevCardCzarIndex + 1];

    if (nextCzar) {
      this.nextCzarID = nextCzar.id;
    } else {
      this.nextCzarID = this.players[0].id;
    }
  }

  private handOutCards(): void {
    this.players.forEach((player) => {
      const playerCards = player.getCards();
      const newCards = this.deck.getWhiteCards(
        Game.MAX_CARDS - playerCards.length
      );

      player.addCards(newCards);
    });
    this.emit<IHandoutCardsPayload>(
      GameEvents.HAND_OUT_CARDS,
      this.players.reduce<IHandoutCardsPayload>((accumulator, player) => {
        accumulator[player.id] = player.getCards();

        return accumulator;
      }, {})
    );
  }

  private endPlay(): void {
    clearTimeout(this.roundTimer);

    const playedCards = this.players
      .filter(({ id }) => id !== this.currentCzarId)
      .map((player) => {
        return player.getCardInPlay();
      })
      .filter(Boolean) as Array<string>;

    if (!playedCards.length) {
      this.endRoundPrematurely("No cards played");
    }

    this.emit<IRoundEndedPayload>(GameEvents.PLAY_ENDED, {
      playedCards,
    });
    this.startPickTimer();
  }

  private startPickTimer(): void {
    this.pickTimer = setTimeout(() => this.endPick, this.config.pickTimer);
    this.emit(GameEvents.PICK_STARTED, {
      pickTimer: this.config.pickTimer,
    });
  }

  private endPick(): void {
    clearTimeout(this.pickTimer);
    this.postRoundHandler();
  }

  private endRoundPrematurely(reason?: string): void {
    if (this.playerReachedMaxPoints()) {
      this.endGame();
      return;
    }

    this.players.forEach((player) => player.clearCardInPlay());
    this.emit(GameEvents.ROUND_ENDED, {
      reason,
    });
    this.startTimer = setTimeout(
      () => this.startRound(),
      Game.TIMER_BETWEEN_ROUNDS
    );
  }

  private postRoundHandler(): void {
    const cardCzar = this.players.find(({ id }) => id === this.currentCzarId);

    // Czar possibly quit
    if (!cardCzar) {
      this.startTimer = setTimeout(
        () => this.startRound(),
        Game.TIMER_BETWEEN_ROUNDS
      );
      return;
    }

    const winningPlayer = this.players.find(
      (player) => cardCzar.getCardPick() === player.getCardInPlay()
    );

    this.emit(GameEvents.PICK_ENDED, {
      playerID: winningPlayer?.id ?? null,
      winningCard: winningPlayer?.getCardInPlay() ?? null,
    });

    if (this.playerReachedMaxPoints()) {
      this.endGame();
      return;
    }

    this.players.forEach((player) => player.clearCardInPlay());
    this.emit(GameEvents.ROUND_ENDED);
    this.startTimer = setTimeout(
      () => this.startRound(),
      Game.TIMER_BETWEEN_ROUNDS
    );
  }

  public endGame(reason?: string): void {
    this.cleanupTimers();
    this.emit(GameEvents.GAME_ENDED, {
      summary: this.getGameSummary(),
      reason,
    });
  }

  private cleanupTimers(): void {
    clearTimeout(this.startTimer);
    clearTimeout(this.roundTimer);
    clearTimeout(this.pickTimer);
  }

  private playerReachedMaxPoints(): boolean {
    return (
      this.players.find(
        (player) => player.getPoints() === this.config.maxPoints
      ) !== undefined
    );
  }

  private allPlayersPlayedCards(): boolean {
    return (
      this.players
        .filter(({ id }) => id !== this.currentCzarId)
        .find((player) => !!player.getCardInPlay()) !== undefined
    );
  }

  private emit<T extends Record<keyof T, unknown> | undefined = undefined>(
    event: GameEvents,
    data?: T
  ): void {
    this.lastEvent = event;
    this.eventEmitter.emit(event, data);
  }
}
