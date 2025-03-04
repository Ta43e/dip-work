import { IsUUID, IsString, IsInt, Max, Min, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  place: string;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(2)
  @Max(20)
  maxPlayers: number;

  @IsInt()
  @Min(1)
  @Max(10)
  skillsLvl: number;

  @IsUUID()
  organizerId: string;

  @IsUUID()
  boardGameId: string;
}