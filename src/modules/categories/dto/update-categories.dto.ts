import { IsUUID, IsString, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  nameCategory?: string;

  @IsOptional()
  @IsString()
  categoryImage?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })  // Массив UUID тегов для категории
  tags?: string[];
}