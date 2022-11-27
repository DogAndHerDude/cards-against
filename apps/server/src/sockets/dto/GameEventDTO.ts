import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { IncomingGameEvent } from '@/room/room';
import { GameEvents } from '@cards-against/game';

export class GameEventDTO {
  @IsString()
  @IsNotEmpty()
  roomID: string;

  @IsIn([GameEvents.PLAYER_CARD_PLAYED, GameEvents.PLAYED_CARD_PICK])
  @IsString()
  @IsNotEmpty()
  event: IncomingGameEvent;

  @IsString({ each: true })
  @IsNotEmpty()
  cards: Array<string>;
}
