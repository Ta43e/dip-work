import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(configPg()),
    UserModule,
    PlayerModule,
    SessionsModule,
    BoardGameModule,
    HistoryGamesModule,
    CategoriesModule,
    EntitiesModule,
  ],
  controllers: [BoardGameController],
})
export class AppModule {}
