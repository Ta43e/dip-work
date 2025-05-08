import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { BoardGame, HistoryGame, Players, Session, Users } from 'entity/some.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramModule } from 'modules/tg-bot/telegram.module';


@Module({
  imports: [TelegramModule, TypeOrmModule.forFeature([Players, Users, Session, HistoryGame, Session, BoardGame])],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
