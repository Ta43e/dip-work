import { PartialType } from '@nestjs/mapped-types';
import { IsUUID, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';
import { CreateHistoryGameDto } from './create-history.dto.ts';

export class UpdateHistoryGameDto extends PartialType(CreateHistoryGameDto) {
  @IsOptional()
  @IsUUID('4')
  sessionId?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })  // Указываем массив UUID игроков
  players?: string[];
}
