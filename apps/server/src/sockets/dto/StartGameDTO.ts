import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class StartGameDTO {
  @IsUUID()
  @IsNotEmpty()
  roomId: string;
}
