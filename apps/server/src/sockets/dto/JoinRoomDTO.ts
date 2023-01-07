import { IsNotEmpty, IsUUID } from 'class-validator';

export class JoinRoomDTO {
  @IsUUID()
  @IsNotEmpty()
  roomId: string;
}
