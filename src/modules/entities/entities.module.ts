import { Module } from '@nestjs/common';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Players, Users, HistoryGame, Session, CustomTags, Skills, TagsForBoardGame, TagsForCategory } from 'entity/some.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Players, Users, Session, HistoryGame, TagsForCategory, Skills, CustomTags, TagsForBoardGame ])],
  controllers: [EntitiesController],
  providers: [EntitiesService]
})
export class EntitiesModule {}
