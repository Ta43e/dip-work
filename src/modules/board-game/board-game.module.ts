import { Module } from '@nestjs/common';
import { BoardGameService } from './board-game.service';
import { BoardGameController } from './board-game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Players, Users, HistoryGame, BoardGame, Session, TagsForBoardGame, Category } from 'entity/some.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Players, Users, Session, HistoryGame, BoardGame, TagsForBoardGame, Category])],
    controllers: [BoardGameController],
    providers: [BoardGameService],
    exports: [BoardGameService],
})
export class BoardGameModule {}
