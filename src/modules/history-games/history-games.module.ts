import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Players, Users, HistoryGame, Session } from 'entity/some.entity';
import { HistoryGameController } from './history-games.controller';
import { HistoryGameService } from './history-games.service';

@Module({
    imports: [TypeOrmModule.forFeature([Players, Users, Session, HistoryGame])],
    controllers: [HistoryGameController],
    providers: [HistoryGameService],
    exports: [HistoryGameService],
})
export class HistoryGamesModule {}
