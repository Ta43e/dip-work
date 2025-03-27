import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'modules/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'entity/some.entity';

@Module({
  imports: [UserModule, PassportModule, TypeOrmModule.forFeature([Users])],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtService, JwtStrategy],
})
export class AuthModule {}