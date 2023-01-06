import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
import { RoomModule } from '@/room/room.module';
import { UserModule } from '@/user/user.module';
import { UserService } from '@/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { v4 } from 'uuid';
import { AuthorizedSocket } from '../AuthorizedSocket';
import { SOCKET_GATEWAY_ERRORS } from '../gateway.errors';
import { SocketGateway } from '../socket.gateway';
import { SocketModule } from '../socket.module';

describe('SocketGateway', () => {
  let gateway: SocketGateway;
  let authService: AuthService;
  let userService: UserService;

  const createMockAuthedSocket = () => {
    return {
      user: {
        id: v4(),
      },
    } as AuthorizedSocket;
  };
  const createMockBasicSocket = (token?: string) => {
    return {
      disconnect: jest.fn(),
      emit: jest.fn(),
      handshake: {
        ...(token && { auth: { token } }),
      },
    } as unknown as Socket;
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [SocketModule, UserModule, RoomModule, AuthModule],
    }).compile();

    gateway = module.get(SocketGateway);
    userService = module.get(UserService);
    authService = module.get(AuthService);
  });

  describe('handleConnection', () => {
    it('Calls disconnect on when no token is given', async () => {
      const socket = createMockBasicSocket();

      await gateway.handleConnection(socket);
      expect(socket.emit).toHaveBeenCalledWith(
        SOCKET_GATEWAY_ERRORS.UNAUTHENTICATED,
      );
      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });

    it('Verifies jwt and assigns socket to user', async () => {
      const user = userService.createUser('name');
      const token = await authService.generateJWT(user.id);
      const socket = createMockBasicSocket(token);

      await gateway.handleConnection(socket);

      const storedUser = userService.getUser(user.id);

      expect(storedUser).toStrictEqual(
        expect.objectContaining({
          socket,
        }),
      );
    });

    it('Emits error when user is not found', async () => {
      const token = await authService.generateJWT(v4());
      const socket = createMockBasicSocket(token);

      await gateway.handleConnection(socket);
      expect(socket.emit).toHaveBeenCalledWith(
        SOCKET_GATEWAY_ERRORS.INVALID_CREDENTIALS,
      );
    });

    it('Emits unauthorized when token cannot be decoded', async () => {
      const otherAuthService = new JwtService({ secret: 'other' });
      const badToken = otherAuthService.sign({ whatever: v4() });
      const socket = createMockBasicSocket(badToken);

      await gateway.handleConnection(socket);
      expect(socket.emit).toHaveBeenCalledWith(
        SOCKET_GATEWAY_ERRORS.UNAUTHORIZED,
      );
    });
  });

  // describe('createRoom', () => {
  //   it('Should create a room and respond with its details', async () => {
  //     const mockSocket = createMockSocket();

  //     expect(gateway.createRoom(mockSocket)).resolves.toStrictEqual({
  //       id: expect.any(String),
  //       players: 1,
  //       isGameInProgress: false,
  //     });
  //   });
  // });
});
