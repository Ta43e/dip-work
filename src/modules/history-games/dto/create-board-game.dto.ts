import { IsUUID, IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateHistoryGameDto {
  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsUUID('4')
  sessionId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true }) 
  players: string[];
}
