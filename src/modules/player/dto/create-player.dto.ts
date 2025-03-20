import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreatePlayerDto {
  eventId: string;
  userId: string;
  namePlayer?: string;
  phoneNumber?: string;
}