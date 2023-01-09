import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetRoomDTO {
  @IsNotEmpty()
  @IsUUID()
  roomId: string;
}
