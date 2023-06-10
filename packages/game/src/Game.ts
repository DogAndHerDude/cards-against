import { EventEmitter } from "events";
import { GameDeck } from "./GameDeck";
import { Player } from "./Player";
import { IGameConfig } from "./IGameConfig";
import { GameEvents } from "./GameEvents";
import { RoundStartedPayload } from "./payloads/RoundStartedPayload";
import { HandoutCardsPayload } from "./payloads/HandoutCardsPayload";
import { RoundEndedPayload } from "./payloads/RoundEndedPayload";
import { TooFewPlayersError } from "./errors/TooFewPlayersError";
import { PlayerDoesNotExistError } from "./errors/PlayerDoesNotExistError";
import { IBlackCard } from "./ICard";

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
  private blackCard?: IBlackCard;
  // TODO: Refactor to an event history data
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

  public getGameSummary() {
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

  public getGameDetails() {
    return {
      players: this.players?.map((player) => player.toPlain()) ?? [],
    };
  }

  public getLastevent() {
    return this.lastEvent;
  }

  public getPlayers() {
    return this.players;
  }

  public getRound() {
    return this.round;
  }

  public getCardCar() {
    return this.currentCzarId;
  }

  public getNextCardCzar() {
    return this.nextCzarID;
  }

  public removePlayer(playerID: string) {
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

  public playCard(playerID: string, cards: string[]) {
    const player = this.players.find(({ id }) => id === playerID);

    if (!player) {
      throw new PlayerDoesNotExistError();
    }

    if (!this.blackCard) {
      throw new Error("PLACEHOLDER: No black card in play");
    }

    if (this.blackCard.pick > cards.length) {
      throw new Error("PLACEHOLDER: Too few cards played.");
    }

    player.playCard(cards);
    this.emit(GameEvents.PLAYER_CARD_PLAYED, {
      playerID,
    });

    if (this.allPlayersPlayedCards()) {
      this.endPlay();
    }
  }

  public pickCards(pickerID: string, cards: string[]) {
    if (pickerID !== this.currentCzarId) {
      return;
    }

    const cardCzar = this.players.find(({ id }) => id === this.currentCzarId);
    const winningPlayer = this.players.find((player) => {
      return (
        player.getCardInPlay()?.filter((card) => cards.includes(card))
          .length === cards.length
      );
    });

    cardCzar?.pickCard(cards);
    winningPlayer?.addPoint();
    this.endPick();
  }

  public startRound() {
    if (!this.round) {
      this.emit(GameEvents.GAME_STARTED);
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
    this.emit<RoundStartedPayload>(GameEvents.ROUND_STARTED, {
      blackCard: this.blackCard,
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

  private handOutCards() {
    this.players.forEach((player) => {
      const playerCards = player.getCards();
      const newCards = this.deck.getWhiteCards(
        Game.MAX_CARDS - playerCards.length
      );

      player.addCards(newCards);
    });
    this.emit<HandoutCardsPayload>(
      GameEvents.HAND_OUT_CARDS,
      this.players.reduce<HandoutCardsPayload>((accumulator, player) => {
        accumulator[player.id] = player.getCards();

        return accumulator;
      }, {})
    );
  }

  private endPlay() {
    clearTimeout(this.roundTimer);

    const playedCards = this.players
      .filter(({ id }) => id !== this.currentCzarId)
      .map((player) => {
        return player.getCardInPlay();
      })
      .filter(Boolean) as string[][];

    if (!playedCards.length) {
      this.endRoundPrematurely("No cards played");
    }

    this.emit<RoundEndedPayload>(GameEvents.PLAY_ENDED, {
      playedCards,
    });
    this.startPickTimer();
  }

  private startPickTimer() {
    this.pickTimer = setTimeout(() => this.endPick, this.config.pickTimer);
    this.emit(GameEvents.PICK_STARTED, {
      pickTimer: this.config.pickTimer,
    });
  }

  private endPick(): void {
    clearTimeout(this.pickTimer);
    this.postRoundHandler();
  }

  private endRoundPrematurely(reason?: string) {
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

  private postRoundHandler() {
    const cardCzar = this.players.find(({ id }) => id === this.currentCzarId);

    // Czar possibly quit
    if (!cardCzar) {
      this.startTimer = setTimeout(
        () => this.startRound(),
        Game.TIMER_BETWEEN_ROUNDS
      );
      return;
    }

    const winningPlayer = this.players.find((player) => {
      const pick = cardCzar.getCardPick();

      return (
        player.getCardInPlay()?.filter((card) => pick?.includes(card))
          .length === pick?.length
      );
    });

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

  public endGame(reason?: string) {
    this.cleanupTimers();
    this.emit(GameEvents.GAME_ENDED, {
      summary: this.getGameSummary(),
      reason,
    });
  }

  private cleanupTimers() {
    clearTimeout(this.startTimer);
    clearTimeout(this.roundTimer);
    clearTimeout(this.pickTimer);
  }

  private playerReachedMaxPoints() {
    return (
      this.players.find(
        (player) => player.getPoints() === this.config.maxPoints
      ) !== undefined
    );
  }

  private allPlayersPlayedCards() {
    return (
      this.players
        .filter(({ id }) => id !== this.currentCzarId)
        .find((player) => !!player.getCardInPlay()) !== undefined
    );
  }

  private emit<T extends Record<keyof T, unknown> | undefined = undefined>(
    event: GameEvents,
    data?: T
  ) {
    this.lastEvent = event;
    this.eventEmitter.emit(event, data);
  }
}
