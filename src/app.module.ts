import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import configPg from 'config/config.pg';
import { PlayerModule } from 'modules/player/player.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { BoardGameController } from './modules/board-game/board-game.controller';
import { BoardGameModule } from './modules/board-game/board-game.module';
import { HistoryGamesModule } from './modules/history-games/history-games.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { EntitiesModule } from 'modules/entities/entities.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ChatModule } from './modules/chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramModule } from 'modules/tg-bot/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forRoot(configPg()),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '30d' },
    }),
    AuthModule,
    UserModule,
    PlayerModule,
    SessionsModule,
    BoardGameModule,
    HistoryGamesModule,
    CategoriesModule,
    EntitiesModule,
    ChatModule,
    TelegramModule,
  ],
  controllers: [BoardGameController],
})
export class AppModule {}
