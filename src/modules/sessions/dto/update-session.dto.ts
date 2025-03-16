import { IsUUID, IsString, IsInt, IsOptional, Max, Min, IsDateString } from 'class-validator';

export class UpdateSessionDto {

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  place?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(20)
  maxPlayers?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  skillsLvl?: number;
}
