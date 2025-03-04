import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Players, Users, HistoryGame, BoardGame, TagsForBoardGame, Category, Session, TagsForCategory } from 'entity/some.entity';
import { CategoryController } from './categories.controller';
import { CategoryService } from './categories.service';

@Module({

    imports: [TypeOrmModule.forFeature([Players, Users, HistoryGame, BoardGame, TagsForBoardGame, Category, Session, TagsForCategory])],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoriesModule {}
