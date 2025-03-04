import { IsOptional, IsString, IsArray } from 'class-validator';

export class FilterDto {
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @IsOptional()
  @IsString()
  playerCount?: string;

  @IsOptional()
  @IsString()
  equipmentFilter?: string;

  @IsOptional()
  @IsString()
  selectedCategory?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedTags?: string[];
}