import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserRoleDto {
    @IsOptional()
    @IsEnum(['active', 'inactive'])
    statusProfile?: 'active' | 'inactive';
  

  @IsOptional()
  @IsEnum(['USER', 'ADMIN', 'MODERATOR', 'ORGANIZER'])
  role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'ORGANIZER';
}