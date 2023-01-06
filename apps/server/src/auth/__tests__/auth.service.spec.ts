import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: '!' })],
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('generateJWT', () => {
    it('Should generate a jwt with given arguments', async () => {
      const token = await authService.generateJWT('my-id');

      expect(token).toStrictEqual(expect.any(String));
    });
  });

  describe('verifyJwt', () => {
    it('It should verify the JWT given valid arguments', async () => {
      const id = 'my-id';
      const token = await authService.generateJWT(id);

      await expect(authService.verifyJWT(token)).resolves.toStrictEqual(
        expect.objectContaining({ id }),
      );
    });

    it('Should throw JsonWebTokenError given invalid arguments', async () => {
      const id = 'my-id';
      const jwtService = new JwtService({ secret: 'wrong' });
      const token = jwtService.sign({ id });

      await expect(authService.verifyJWT(token)).rejects.toThrowError();
    });
  });
});
