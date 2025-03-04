import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  nickname?: string;

  @IsOptional()
  @IsString()
  mainPhoto?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  statusProfile?: 'active' | 'inactive';

  @IsOptional()
  @IsEnum(['USER', 'ADMIN', 'MODERATOR', 'ORGANIZER'])
  role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER';
}
