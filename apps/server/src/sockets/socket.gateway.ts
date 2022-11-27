import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketGatewayConnectionEvents } from './gateway.events';
import { SocketGatewayErrors } from './gateway.errors';
import { UserService } from '@/user/user.service';
import { AuthService } from '@/auth/auth.service';
import { UserExistsError } from '@/user/errors/UserExistsError';
import { RoomService } from '@/room/room.service';
import { AuthorizedSocket } from './AuthorizedSocket';
import { IncomingRoomEvents } from '@/room/events';
import { MessageDTO } from './dto/MessageDTO';
import { StartGameDTO } from './dto/StartGameDTO';
import { UserNotFoundError } from '@/user/errors/UserNotFoundError';
import { WsUserNotFoundException } from './errors/WsUserNotFoundException';
import { WsInternalServerErrorException } from './errors/WsInternalServerErrorException';
import { GameEventDTO } from './dto/GameEventDTO';
import { RoomNotFoundError } from '@/room/RoomNotFoundError';
import { WsRoomNotFoundException } from './errors/WsRoomNotFoundException';

@WebSocketGateway({ transports: ['websocket'] })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server!: Server;

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly roomService: RoomService,
  ) {}

  public async handleConnection(socket: Socket): Promise<void> {
    if (!socket.handshake.query.name) {
      socket.emit(SocketGatewayConnectionEvents.ERROR, {
        status: 'error',
        message: SocketGatewayErrors.USER_NAME_REQUIRED_ERROR,
      });
      socket.disconnect(true);
      return;
    }

    try {
      const user = this.userService.createUser(
        socket.handshake.query.name as string,
        socket,
      );

      socket.handshake.auth.token = this.authService.generateJWT(user.id);

      // TODO: Emit Authenticated event
    } catch (error) {
      if (error instanceof UserExistsError) {
        socket.emit(SocketGatewayConnectionEvents.ERROR, {
          status: 'error',
          message: SocketGatewayErrors.USER_NAME_TAKEN_ERROR,
        });
        socket.disconnect(true);
        return;
      }

      socket.emit(SocketGatewayConnectionEvents.ERROR, {
        status: 'error',
        message: SocketGatewayErrors.INTERNAL_SERVER_ERROR,
      });
      socket.disconnect(true);
    }
  }

  public handleDisconnect(client: Socket): void {
    if (client.handshake.auth.token) {
      try {
        // 1. decode token
        // 2. find user and remove from session
      } catch {}
    }
  }

  @SubscribeMessage(IncomingRoomEvents.LIST_ROOMS)
  public handleListRooms() {
    return this.roomService.listRooms();
  }

  @SubscribeMessage(IncomingRoomEvents.MESSAGE)
  public handleIncomingMessage(
    @ConnectedSocket() socket: AuthorizedSocket,
    @MessageBody() data: MessageDTO,
  ): void {
    try {
      const user = this.userService.getUser(socket.user.id);
      const room = this.roomService.getRoom(data.roomID);

      room.messageRoom(user, data.message);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new WsUserNotFoundException();
      }

      if (error instanceof RoomNotFoundError) {
        throw new WsRoomNotFoundException();
      }

      throw new WsInternalServerErrorException();
    }
  }

  @SubscribeMessage(IncomingRoomEvents.GAME_EVENT)
  public handleGameEvent(
    @ConnectedSocket() socket: AuthorizedSocket,
    @MessageBody() data: GameEventDTO,
  ): void {
    try {
      const user = this.userService.getUser(socket.user.id);
      const room = this.roomService.getRoom(data.roomID);

      room.handleIncomingGameEvent(user, {
        event: data.event,
        data: {
          card: data.cards[0], // TODO: room needs to be refactored to take multiple cards, in turn so will the game need to be refactored to account for that
        },
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new WsUserNotFoundException();
      }

      if (error instanceof RoomNotFoundError) {
        throw new WsRoomNotFoundException();
      }

      throw new WsInternalServerErrorException();
    }
  }

  @SubscribeMessage(IncomingRoomEvents.START_GAME)
  public handleGameStart(
    @ConnectedSocket() socket: AuthorizedSocket,
    @MessageBody() data: StartGameDTO,
  ): void {
    try {
      // TODO: refactor getUser to throw error and just handle it all in a catch block
      const user = this.userService.getUser(socket.user.id);
      const room = this.roomService.getRoom(data.roomID);

      room.startGame(user);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new WsUserNotFoundException();
      }

      if (error instanceof RoomNotFoundError) {
        throw new WsRoomNotFoundException();
      }

      throw new WsInternalServerErrorException();
    }
  }
}
