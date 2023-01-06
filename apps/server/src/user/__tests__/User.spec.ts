import { Socket } from 'socket.io';
import { User } from '../User';

describe('User', () => {
  describe('constructor', () => {
    it('Should  create a new user with an ID and socket', () => {
      const name = 'name';
      const user = new User(name);

      expect(user).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          name,
        }),
      );
    });
  });

  describe('setSocket', () => {
    it('Sets a given socket on the user', () => {
      const name = 'name';
      const socket = { whatever: true } as unknown as Socket;
      const user = new User(name);

      user.setSocket(socket);

      expect(user).toStrictEqual(
        expect.objectContaining({
          socket,
        }),
      );
    });
  });
});
