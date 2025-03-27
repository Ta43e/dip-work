import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardGame, HistoryGame, Players, Skills, Users, Session } from 'entity/some.entity';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from 'modules/firebase/firebase-service';
import { AdminUserController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users]), TypeOrmModule.forFeature([Skills]), TypeOrmModule.forFeature([Players]), TypeOrmModule.forFeature([HistoryGame]),TypeOrmModule.forFeature([Session]),TypeOrmModule.forFeature([BoardGame])],
  controllers: [UserController, AdminUserController],
  providers: [UserService, JwtService, FirebaseService, AdminUsersService],
  exports: [UserService, FirebaseService, AdminUsersService],
})
export class UserModule {}
