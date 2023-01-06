import { UserModule } from '@/user/user.module';
import { UserService } from '@/user/user.service';
import { ConflictException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginDTO } from '../dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let userService: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: '!' }), UserModule],
      providers: [AuthService, AuthController],
    }).compile();

    controller = module.get(AuthController);
    userService = module.get(UserService);
  });

  describe('login', () => {
    it('Creates user and returns token when name is not taken', async () => {
      const dto = plainToInstance(LoginDTO, { name: 'Cringe 5000' });

      await expect(controller.login(dto)).resolves.toStrictEqual({
        token: expect.any(String),
      });
    });

    it('Throws ConflictException when user exists', async () => {
      const name = 'Cringe 5000';
      const dto = plainToInstance(LoginDTO, { name });

      userService.createUser(name);

      await expect(controller.login(dto)).rejects.toThrowError(
        ConflictException,
      );
    });
  });
});
