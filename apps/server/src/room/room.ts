import { v4 } from 'uuid';
import { Server } from 'socket.io';
import { EventEmitter } from 'events';
import { User } from '@/user/User';
import {
  CardService,
  DefaultGameConfig,
  Game,
  GameDeck,
  GameEvents,
  Player,
} from '@cards-against/game';
import { InternalRoomEvents, OutgoingRoomEvents } from './events';
import { instanceToPlain } from 'class-transformer';
import { GameInProgressError } from './GameInProgressError';
import { GameNotInProgressError } from './GameNotInProgressError';
import { BadEventError } from './BadEventError';

// TODO: Refactor enum to as const
export type IncomingGameEvent =
  | GameEvents.PLAYER_CARD_PLAYED
  | GameEvents.PLAYED_CARD_PICK;

export type IncomingGameEventPayload = {
  event: IncomingGameEvent;
  data: {
    card: string;
  };
};

export class Room {
  public readonly id = v4();
  private server: Server;
  public players = new Set<User>();
  public owner: User;
  private readonly cardService = new CardService();
  // TODO: Refactor to GameConfig that implements IGameConfig and generates default config within with methods to manipulate the config
  private gameConfig = new DefaultGameConfig();
  private game?: Game;
  private emitter = new EventEmitter();

  // TODO: Allow users to switch between spectators and players before the game starts
  constructor(owner: User, server: Server) {
    this.owner = owner;
    this.server = server;

    this.players.add(owner);
    owner.socket.join(this.id);
  }

  public on(event: InternalRoomEvents, cb: () => void): void {
    this.emitter.on(event, cb);
  }

  public addUser(user: Required<User>): void {
    this.players.add(user);
    user.socket.join(this.id);
    this.server.to(this.id).emit(OutgoingRoomEvents.USER_JOINED, {
      user: instanceToPlain(user),
    });
  }

  public removeUser(user: User): void {
    this.players.delete(user);

    // TODO: If fewer than min required players then stop game and emit game ended event

    if (this.players.size && user === this.owner) {
      this.owner = Array.from(this.players.values())[0];
    }

    if (!this.players.size) {
      this.emitter.emit(InternalRoomEvents.ROOM_CLOSED);
    }

    this.server.to(this.id).emit(OutgoingRoomEvents.USER_LEFT, {
      userId: user.id,
    });
  }

  public isGameInProgress(): boolean {
    return !!this.game;
  }

  public startGame(): void {
    // TODO: If fewer than min players emit error
    if (this.game) {
      throw new GameInProgressError();
    }

    this.game = new Game(
      Array.from(this.players.values()).map(
        (playerUser) => new Player(playerUser.id),
      ),
      this.gameConfig,
      new GameDeck(this.cardService.getDeck(this.gameConfig.packs)),
    );

    this.handleOutgoingGameEvents();
    this.game.startRound();
  }

  // TODO: allow multiple card picks
  public handleIncomingGameEvent(
    user: User,
    { event, data }: IncomingGameEventPayload,
  ): void {
    if (!this.game) {
      throw new GameNotInProgressError();
    }

    switch (event) {
      case GameEvents.PLAYER_CARD_PLAYED:
        this.game.playCard(user.id, data.card);
        return;
      case GameEvents.PLAYED_CARD_PICK:
        this.game.pickCard(user.id, data.card);
        return;
      default:
        throw new BadEventError();
    }
  }

  private handleOutgoingGameEvents(): void {
    if (!this.game) {
      return;
    }

    this.game.on(GameEvents.GAME_STARTED, () =>
      this.server.to(this.id).emit(GameEvents.GAME_STARTED),
    );
    this.game.on(GameEvents.HAND_OUT_CARDS, (data) =>
      Object.entries(data).forEach(([userId, whiteCards]) => {
        const user = Array.from(this.players.values()).find(
          (user) => user.id === userId,
        );

        if (!user) {
          return;
        }

        user.socket.emit(GameEvents.HAND_OUT_CARDS, { whiteCards });
      }),
    );
    // TODO: Refactor to allow listening to all outgoing events
    //       Will simplify this implementation as all the game events are the same
    //       essentially here.
    this.game.on(GameEvents.ROUND_STARTED, (data) =>
      this.server.to(this.id).emit(GameEvents.ROUND_STARTED, data),
    );
    this.game.on(GameEvents.PLAYER_CARD_PLAYED, (data) =>
      this.server.to(this.id).emit(GameEvents.PLAYER_CARD_PLAYED, data),
    );
    this.game.on(GameEvents.PLAY_ENDED, (data) =>
      this.server.to(this.id).emit(GameEvents.PLAY_ENDED, data),
    );
    this.game.on(GameEvents.PICK_STARTED, (data) =>
      this.server.to(this.id).emit(GameEvents.PICK_STARTED, data),
    );
    this.game.on(GameEvents.PICK_ENDED, (data) =>
      this.server.to(this.id).emit(GameEvents.PICK_ENDED, data),
    );
    this.game.on(GameEvents.ROUND_ENDED, (data) =>
      this.server.to(this.id).emit(GameEvents.ROUND_ENDED, data),
    );
    this.game.on(GameEvents.GAME_ENDED, (data) =>
      this.server.to(this.id).emit(GameEvents.GAME_ENDED, data),
    );
  }
}
