import { IsUUID, IsString, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';
export interface Tag {
  id: string;
  nameTag: string;
}


export class CreateCategoryDto {
  @IsString()
  nameCategory: string;

  @IsString()
  categoryImage: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })  // Массив UUID тегов для категории
  tags?: string[];
}

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
