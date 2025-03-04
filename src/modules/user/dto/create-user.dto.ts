import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(3, 100)
  nickname: string;

  @IsString()
  hashPassword: string;

  @IsOptional()
  @IsString()
  mainPhoto?: string;

  @IsEnum(['active', 'inactive'])
  statusProfile?: 'active' | 'inactive';

  @IsEnum(['USER', 'ADMIN', 'MODERATOR', 'ORGANIZER'])
  role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER';
}
