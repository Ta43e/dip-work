import { IsString, IsInt, IsOptional } from 'class-validator';

export class PlayerDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsInt()
  result?: number;

  @IsOptional()
  @IsInt()
  score?: number;
}