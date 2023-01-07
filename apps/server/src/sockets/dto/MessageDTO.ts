import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDTO {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
