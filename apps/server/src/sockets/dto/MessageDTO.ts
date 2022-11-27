import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDTO {
  @IsString()
  @IsNotEmpty()
  roomID: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
