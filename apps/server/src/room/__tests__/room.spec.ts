import 'reflect-metadata';
import { User } from '@/user/User';
import { Game, GameEvents } from '@cards-against/game';
import { instanceToPlain } from 'class-transformer';
import { Server, Socket } from 'socket.io';
import { InternalRoomEvents, OutgoingRoomEvents } from '../events';
import { GameInProgressError } from '../GameInProgressError';
import { GameNotInProgressError } from '../GameNotInProgressError';
import { IncomingGameEvent, Room } from '../room';
import { BadEventError } from '../BadEventError';

jest.mock('@cards-against/game/Game', () => ({
  Game: jest.fn(() => ({
    startRound: jest.fn(),
    playCard: jest.fn(),
    pickCard: jest.fn(),
    on: jest.fn(),
  })),
}));

describe('Room', () => {
  const mockSocketBuilder = () => {
    return {
      join: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;
  };

  const mockSocketServerBuilder = () => {
    const mockServer = {
      to: jest.fn(() => mockServer),
      emit: jest.fn(),
    } as unknown as Server;

    return mockServer;
  };

  describe('constructor', () => {
    it('should instantiate and adds owner to players', () => {
      const server = mockSocketServerBuilder();
      const socket = mockSocketBuilder();
      const owner = new User('name');

      owner.setSocket(socket);

      const room = new Room(owner, server);

      expect(room).toBeDefined();
      expect(room.users.has(owner)).toBeTruthy();
      expect(owner.socket.join).toHaveBeenCalledWith(room.id);
    });
  });

  describe('addUser', () => {
    it('should add a new unique user and have it join room', () => {
      const server = mockSocketServerBuilder();
      const ownerSocket = mockSocketBuilder();
      const playerSocket = mockSocketBuilder();
      const owner = new User('owner');
      const player = new User('player');

      owner.setSocket(ownerSocket);
      player.setSocket(playerSocket);

      const room = new Room(owner, server);

      room.addUser(player as Required<User>);
      expect(room.users.has(player)).toBeTruthy();
      expect(playerSocket.join).toHaveBeenCalledWith(room.id);
      expect(server.to).toHaveBeenCalledWith(room.id);
      expect(server.emit).toHaveBeenCalledWith(OutgoingRoomEvents.USER_JOINED, {
        user: instanceToPlain(player),
      });
    });
  });

  describe('removeUser', () => {
    it('should remove an existing player if user is player', () => {
      const server = mockSocketServerBuilder();
      const playerSocket = mockSocketBuilder();
      const ownerSocket = mockSocketBuilder();
      const owner = new User('owner');
      const player = new User('player');

      owner.setSocket(ownerSocket);
      player.setSocket(playerSocket);

      const room = new Room(owner, server);

      room.addUser(player as Required<User>);
      room.removeUser(player);
      expect(room.owner).toEqual(owner);
      expect(room.users.has(player)).toBeFalsy();
      expect(server.to).toHaveBeenCalledWith(room.id);
      expect(server.emit).toHaveBeenLastCalledWith(
        OutgoingRoomEvents.USER_LEFT,
        {
          userId: player.id,
        },
      );
    });

    it('Should remove user from the list of players and emit event if last user', () => {
      const server = mockSocketServerBuilder();
      const socket = mockSocketBuilder();
      const owner = new User('owner');

      owner.setSocket(socket);

      const room = new Room(owner, server);
      const eventCb = jest.fn();

      room.on(InternalRoomEvents.ROOM_CLOSED, eventCb);
      room.removeUser(owner);

      expect(room.users.size).toBe(0);
      expect(eventCb).toHaveBeenCalled();
    });

    it('Should select a new owner when the owner leaves', () => {
      const server = mockSocketServerBuilder();
      const playerSocket = mockSocketBuilder();
      const ownerSocket = mockSocketBuilder();
      const owner = new User('owner');
      const player = new User('player');

      owner.setSocket(ownerSocket);
      player.setSocket(playerSocket);

      const room = new Room(owner, server);

      room.addUser(player as Required<User>);
      room.removeUser(owner);

      expect(room.owner).toEqual(player);
    });

    it.todo('Emits game ended when fewer than min required players');
  });

  describe('isGameInProgress', () => {
    it.each([[true], [false]])(
      'Returns true|false whether the game is present',
      (exists) => {
        const server = mockSocketServerBuilder();
        const socket = mockSocketBuilder();
        const owner = new User('owner');

        owner.setSocket(socket);

        const room = new Room(owner, server);

        if (exists) {
          room['game'] = {} as any;
        }

        expect(room.isGameInProgress()).toBe(exists);
      },
    );
  });

  describe('startGame', () => {
    it('Should create new Game instance when no game is in progress', () => {
      const server = mockSocketServerBuilder();
      const playerSocket = mockSocketBuilder();
      const ownerSocket = mockSocketBuilder();
      const owner = new User('owner');
      const player = new User('player');

      owner.setSocket(ownerSocket);
      player.setSocket(playerSocket);

      const room = new Room(owner, server);

      room.addUser(player as Required<User>);
      room.startGame();

      const game: Game = Reflect.get(room, 'game');

      expect(game).toBeDefined();
      expect(game.startRound).toHaveBeenCalled();
      expect(game.on).toHaveBeenCalledTimes(9);
    });

    it('Should throw error when game is already in progress', () => {
      const server = mockSocketServerBuilder();
      const playerSocket = mockSocketBuilder();
      const ownerSocket = mockSocketBuilder();
      const owner = new User('owner');
      const player = new User('player');

      owner.setSocket(ownerSocket);
      player.setSocket(playerSocket);

      const room = new Room(owner, server);

      room.addUser(player as Required<User>);
      room.startGame();

      expect(() => room.startGame()).toThrowError(GameInProgressError);
    });

    it.todo('Shoudl call all outgoing game events');
  });

  describe('handleIncomingGameEvent', () => {
    it('Should throw an error when no game is in progress', () => {
      const server = mockSocketServerBuilder();
      const playerSocket = mockSocketBuilder();
      const ownerSocket = mockSocketBuilder();
      const owner = new User('owner');
      const player = new User('player');

      owner.setSocket(ownerSocket);
      player.setSocket(playerSocket);

      const room = new Room(owner, server);

      room.addUser(player as Required<User>);

      expect(() =>
        room.handleIncomingGameEvent(player, {
          event: GameEvents.PLAYED_CARD_PICK,
          data: {
            card: 'asd',
          },
        }),
      ).toThrowError(GameNotInProgressError);
    });

    it.each([[GameEvents.PLAYER_CARD_PLAYED], [GameEvents.PLAYED_CARD_PICK]])(
      'Should match passed event with related game method',
      (event) => {
        const server = mockSocketServerBuilder();
        const playerSocket = mockSocketBuilder();
        const ownerSocket = mockSocketBuilder();
        const owner = new User('owner');
        const player = new User('player');

        owner.setSocket(ownerSocket);
        player.setSocket(playerSocket);

        const room = new Room(owner, server);
        const payload = {
          event: event as IncomingGameEvent,
          data: {
            card: 'card',
          },
        };

        room.addUser(player as Required<User>);
        room.startGame();

        const game: Game = Reflect.get(room, 'game');

        room.handleIncomingGameEvent(player, payload);

        switch (event) {
          case GameEvents.PLAYER_CARD_PLAYED:
            expect(game.playCard).toHaveBeenCalledWith(
              player.id,
              payload.data.card,
            );
            break;
          case GameEvents.PLAYED_CARD_PICK:
            expect(game.pickCard).toHaveBeenCalledWith(
              player.id,
              payload.data.card,
            );
            break;
          default:
            throw new Error('Bad event.');
        }
      },
    );

    it('Shoud throw an error when the event does not match possible events', () => {
      const server = mockSocketServerBuilder();
      const playerSocket = mockSocketBuilder();
      const ownerSocket = mockSocketBuilder();
      const owner = new User('owner');
      const player = new User('player');

      owner.setSocket(ownerSocket);
      player.setSocket(playerSocket);

      const room = new Room(owner, server);
      const payload = {
        event: 'asd' as IncomingGameEvent,
        data: {
          card: 'card',
        },
      };

      room.addUser(player as Required<User>);
      room.startGame();

      expect(() => room.handleIncomingGameEvent(player, payload)).toThrowError(
        BadEventError,
      );
    });
  });
});
