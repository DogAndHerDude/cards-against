import { IsNotEmpty, IsString } from 'class-validator';

export class StartGameDTO {
  @IsString()
  @IsNotEmpty()
  roomID: string;
}
