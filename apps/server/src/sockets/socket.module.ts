import { AuthModule } from '@/auth/auth.module';
import { RoomModule } from '@/room/room.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [AuthModule, UserModule, RoomModule],
  providers: [SocketGateway],
})
export class SocketModule {}
