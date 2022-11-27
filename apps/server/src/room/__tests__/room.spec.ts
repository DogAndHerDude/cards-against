import { User } from '@/user/User';
import { Server, Socket } from 'socket.io';
import { InternalRoomEvents, OutgoingRoomEvents } from '../events';
import { Room } from '../room';

describe('Room', () => {
  const mockSocketBuilder = () => {
    return {
      join: jest.fn(),
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
      const owner = new User('name', socket);
      const room = new Room(owner, server);

      expect(room).toBeDefined();
      expect(room.players.has(owner)).toBeTruthy();
      expect(owner.socket.join).toHaveBeenCalledWith(room.id);
    });
  });

  describe('addUser', () => {
    it('should add a new unique user and have it join room', () => {
      const server = mockSocketServerBuilder();
      const playerSocket = mockSocketBuilder();
      const owner = new User('owner', mockSocketBuilder());
      const player = new User('player', playerSocket);
      const room = new Room(owner, server);

      room.addUser(player);

      expect(room.players.has(player)).toBeTruthy();
      expect(playerSocket.join).toHaveBeenCalledWith(room.id);
      expect(server.to).toHaveBeenCalledWith(room.id);
      expect(server.emit).toHaveBeenCalledWith(OutgoingRoomEvents.USER_JOINED, {
        user: player.toPlain(),
      });
    });
  });

  describe('removeUser', () => {
    it('should remove an existing player if user is player', () => {
      const server = mockSocketServerBuilder();
      const playerSocket = mockSocketBuilder();
      const owner = new User('owner', mockSocketBuilder());
      const player = new User('player', playerSocket);
      const room = new Room(owner, server);

      room.addUser(player);
      room.removeUser(player);

      expect(room.owner).toEqual(owner);
      expect(room.players.has(player)).toBeFalsy();
      expect(server.to).toHaveBeenCalledWith(room.id);
      expect(server.emit).toHaveBeenLastCalledWith(
        OutgoingRoomEvents.USER_LEFT,
        {
          user: player.id,
        },
      );
    });

    it('Should remove user from the list of players and emit event if last user', () => {
      const server = mockSocketServerBuilder();
      const owner = new User('owner', mockSocketBuilder());
      const room = new Room(owner, server);
      const eventCb = jest.fn();

      room.on(InternalRoomEvents.ROOM_CLOSED, eventCb);
      room.removeUser(owner);

      expect(room.players.size).toBe(0);
      expect(eventCb).toHaveBeenCalled();
    });

    it('Should select a new owner when the owner leaves', () => {
      const server = mockSocketServerBuilder();
      const playerSocket = mockSocketBuilder();
      const owner = new User('owner', mockSocketBuilder());
      const player = new User('player', playerSocket);
      const room = new Room(owner, server);

      room.addUser(player);
      room.removeUser(owner);

      expect(room.owner).toEqual(player);
    });

    it.todo('Should remove an existing spectator if user is spectator');
  });

  describe('isGameInProgress', () => {
    it.todo('should return true|false whether the game is present');
  });

  describe('startGame', () => {
    it.todo('Should create new Game instance when no game is in progress');
    it.todo('Should handle and emit outgoing game events');
    it.todo('Should throw error when user starting game is not owner');
    it.todo('Should throw error when game is already in progress');
  });

  describe('handleIncomingGameEvent', () => {
    it.todo('Should throw an error when no game is in progress');
    it.todo('Should match passed even with related game method');
    it.todo(
      'Shoud throw an error when the event does not match possible events',
    );
  });
});
