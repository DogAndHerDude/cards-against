import { IsNotEmpty, IsUUID } from 'class-validator';

export class LeaveRoomDTO {
  @IsUUID()
  @IsNotEmpty()
  roomId: string;
}
