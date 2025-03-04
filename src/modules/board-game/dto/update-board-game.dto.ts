 
 import { 
    IsUUID, 
    IsString, 
    IsInt, 
    IsOptional, 
    Min, 
    Max, 
    IsArray 
  } from 'class-validator';

  
 export class UpdateBoardGameDto {
    @IsOptional()
    @IsString()
    nameBoardGame?: string;
  
    @IsOptional()
    @IsString()
    equipment?: string;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    minPlayers?: number;
  
    @IsOptional()
    @IsInt()
    @Min(2)
    maxPlayers?: number;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsInt()
    @Min(3)
    @Max(100)
    age?: number;
  
    @IsOptional()
    @IsString()
    boardGameImage?: string;
  
    @IsOptional()
    @IsString()
    rules?: string;
  
    @IsOptional()
    @IsUUID()
    categoryId?: string;
  
    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    tags?: string[];
  }
  