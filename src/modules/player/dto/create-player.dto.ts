import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreatePlayerDto {
  eventId: string;
  namePlayer?: string;
  phoneNumber?: string;
}