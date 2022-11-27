import { Socket } from 'socket.io';
import { User } from '../User';

describe('User', () => {
  describe('constructor', () => {
    it('Should  create a new user with an ID and socket', () => {
      const name = 'name';
      const socket = { socket: true } as unknown as Socket;
      const user = new User(name, socket);

      expect(user).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          name,
          socket,
        }),
      );
    });
  });
});
