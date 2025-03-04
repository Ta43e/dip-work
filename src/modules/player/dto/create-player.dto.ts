import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreatePlayerDto {
  userId: string;
  sessionId: string;
}