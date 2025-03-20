import { IsUUID, IsString, IsInt, Max, Min, IsDateString, Matches } from 'class-validator';

export class CreateSessionDto {

  @IsString()
  sessionName: string;

  @IsString()
  city: string;

  @IsString()
  place: string;

  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Time must be in HH:mm format" })
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

  @IsString()
  game: string;
}