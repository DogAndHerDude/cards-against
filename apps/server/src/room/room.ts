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
  public players = new Set<User>();
  public spectators = new Set<User>();
  // TODO: Refactor to GameConfig that implements IGameConfig and generates default config within
  //       with methods to manipulate the config
  private readonly cardService = new CardService();
  private gameConfig = new DefaultGameConfig();
  private game?: Game;
  private emitter = new EventEmitter();

  // TODO: Allow users to switch between spectators and players before the game starts
  constructor(public owner: User, private readonly server: Server) {
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
      user: user.toPlain(),
    });
  }

  public removeUser(user: User): void {
    this.players.delete(user);
    this.spectators.delete(user);

    if (this.players.size) {
      this.owner = Array.from(this.players.entries())[0][0];
    }

    if (!this.players.size) {
      this.emitter.emit(InternalRoomEvents.ROOM_CLOSED);
    }

    // TODO: if user is owner, pass ownership to next player
    // TODO: if no players left, emit close room

    this.server.to(this.id).emit(OutgoingRoomEvents.USER_LEFT, {
      user: user.id,
    });
  }

  // TODO: Re-implement and test
  public messageRoom(user: User, message: string): void {
    this.server.to(this.id).emit(OutgoingRoomEvents.MESSAGE, {
      from: user.id,
      message,
    });
  }

  public isGameInProgress(): boolean {
    return !!this.game;
  }

  public startGame(user: User): void {
    if (this.game) {
      // TODO: Emit error that game already started
      return;
    }

    if (user.id !== this.owner.id) {
      // TODO: Emit error that user is not the owner
      return;
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
      // TODO: Emit an error to the user
      return;
    }

    switch (event) {
      case GameEvents.PLAYER_CARD_PLAYED:
        this.game.playCard(user.id, data.card);
        return;
      case GameEvents.PLAYED_CARD_PICK:
        this.game.pickCard(user.id, data.card);
        return;
      default:
        // TODO: Emit an error to the user
        return;
    }
  }

  private handleOutgoingGameEvents(): void {
    if (!this.game) {
      return;
    }

    this.game.on(GameEvents.GAME_STARTED, () =>
      this.server.in(this.id).emit(GameEvents.GAME_STARTED),
    );
    this.game.on(GameEvents.HAND_OUT_CARDS, (data) =>
      Object.entries(data).forEach(([userID, whiteCards]) => {
        const user = Array.from(this.players.values()).find(
          (user) => user.id === userID,
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
