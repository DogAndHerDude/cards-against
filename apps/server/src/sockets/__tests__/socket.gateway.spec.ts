import 'reflect-metadata';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
import { RoomModule } from '@/room/room.module';
import { User } from '@/user/User';
import { UserModule } from '@/user/user.module';
import { UserService } from '@/user/user.service';
import { RoomService } from '@/room/room.service';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { v4 } from 'uuid';
import { AuthorizedSocket } from '../AuthorizedSocket';
import { SOCKET_GATEWAY_ERRORS } from '../gateway.errors';
import { SocketGateway } from '../socket.gateway';
import { SocketModule } from '../socket.module';
import { plainToInstance } from 'class-transformer';
import { JoinRoomDTO } from '../dto/JoinRoomDTO';

describe('SocketGateway', () => {
  let gateway: SocketGateway;
  let authService: AuthService;
  let userService: UserService;
  let roomService: RoomService;
  let mockServer: Server;

  const createMockServer = () => {
    const server = {
      to: jest.fn(() => server),
      emit: jest.fn(),
    } as unknown as Server;

    return server;
  };

  const createMockAuthedSocket = (id?: string) => {
    return {
      user: {
        id: id ?? v4(),
      },
      join: jest.fn(),
    } as unknown as AuthorizedSocket;
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
  const createAuthedUser = (count = 1) => {
    return Array(count)
      .fill(null)
      .map((_, idx) => {
        const user = userService.createUser(`User ${idx}`);
        const socket = createMockAuthedSocket(user.id);

        user.setSocket(socket);

        return user;
      });
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [SocketModule, UserModule, RoomModule, AuthModule],
    }).compile();

    gateway = module.get(SocketGateway);
    userService = module.get(UserService);
    authService = module.get(AuthService);
    roomService = module.get(RoomService);
  });

  beforeEach(() => {
    gateway.server = mockServer = createMockServer();
    const users: Map<string, User> = Reflect.get(userService, 'users');

    users.clear();
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

  describe('createRoom', () => {
    it('Should create a room and respond with its details', async () => {
      const user = userService.createUser('name');
      const mockSocket = createMockAuthedSocket(user.id);

      user.setSocket(mockSocket);
      expect(gateway.createRoom(mockSocket)).toStrictEqual({
        id: expect.any(String),
        players: 1,
        gameInProgress: false,
      });
    });
  });

  describe('joinRoom', () => {
    it('Adds player to a specified room', () => {
      const [owner, player] = createAuthedUser(2);
      const result = gateway.createRoom(owner.socket as AuthorizedSocket);
      const room = roomService.getRoom(result.id);
      const dto = plainToInstance(JoinRoomDTO, { roomId: result.id });

      gateway.joinRoom(player.socket as AuthorizedSocket, dto);
      expect(room.users.has(player)).toBeTruthy();
    });
  });

  describe('leaveRoom', () => {
    it.todo('Removes player from room');
  });
});
