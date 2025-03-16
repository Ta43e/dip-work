import { IsUUID, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateTagForCategoryDto {
  @IsString()
  tag: string;
}

export class UpdateTagForCategoryDto {
  @IsOptional()
  @IsString()
  nameTag?: string;
}

export class CreateSkillDto {
  @IsString()
  boardGameName: string;

  @IsInt()
  @Min(1)
  @Max(100)
  skillLvl: number;

  @IsString()
  skillPercent: string;

  @IsUUID()
  userId: string;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  boardGameName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  skillLvl?: number;

  @IsOptional()
  @IsString()
  skillPercent?: string;
}

export class CreateCustomTagDto {
  @IsUUID()
  sessionId: string;

  @IsString()
  nameTag: string;
}

export class UpdateCustomTagDto {
  @IsOptional()
  @IsString()
  nameTag?: string;
}

export class CreateTagForBoardGameDto {
  @IsString()
  nameTag: string;
}

export class UpdateTagForBoardGameDto {
  @IsOptional()
  @IsString()
  nameTag?: string;
}
