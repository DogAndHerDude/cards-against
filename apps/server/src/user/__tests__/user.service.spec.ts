import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { UserExistsError } from '../errors/UserExistsError';
import { User } from '../User';
import { UserService } from '../user.service';

describe('UserService', () => {
  let userService: UserService;
  const socket = {} as unknown as Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('Should create adnd return a user with given arguments', () => {
      expect(userService.createUser('name', socket)).toBeInstanceOf(User);
    });

    it('Should throw UserExistsError when user with a given name already exists', () => {
      const user = userService.createUser('name', socket);

      expect(() => userService.createUser(user.name, socket)).toThrowError(
        UserExistsError,
      );
    });
  });

  describe('getUser', () => {
    it.todo('Should return a user when it exists');
    it.todo('Should throw UserNotFound when user does not exist');
  });

  describe('removeUser', () => {
    it('Should remove existing user', () => {
      const user = userService.createUser('name', socket);

      userService.removeUser(user.id);

      expect(userService.getUser(user.id)).toBeUndefined();
    });
  });
});
