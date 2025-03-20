import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class UpdatePlayerDto {
  userId?: any;
  namePlayer?: string;
  phoneNumber?: string;
  sessionId?: any;
}
