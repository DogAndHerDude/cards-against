import { Test } from '@nestjs/testing';
import { UserExistsError } from '../errors/UserExistsError';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { User } from '../User';
import { UserService } from '../user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('Should create adnd return a user with given arguments', () => {
      expect(userService.createUser('name')).toBeInstanceOf(User);
    });

    it('Should throw UserExistsError when user with a given name already exists', () => {
      const user = userService.createUser('name');

      expect(() => userService.createUser(user.name)).toThrowError(
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
      const user = userService.createUser('name');

      userService.removeUser(user.id);
      expect(() => userService.getUser(user.id)).toThrowError(
        UserNotFoundError,
      );
    });
  });
});
