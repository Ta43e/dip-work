import { IsBoolean, IsOptional, IsArray, isNumber, IsInt } from 'class-validator';
import { PlayerDto } from './player.dto';


export class CreateHistoryDto {
  @IsInt()
  hasNoResults: number;

  @IsOptional()
  @IsArray()
  results?: PlayerDto[];
}