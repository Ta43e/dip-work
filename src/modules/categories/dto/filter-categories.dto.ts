import { IsOptional, IsString, IsArray } from 'class-validator';
import { Transform } from "class-transformer";

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
  @Transform(({ value }) => {
    console.log("📌 Преобразуем selectedTags:", value);
    if (!value) return [];
    return Array.isArray(value) ? value : [String(value)];
  })
  selectedTags: string[] = [];
  
}