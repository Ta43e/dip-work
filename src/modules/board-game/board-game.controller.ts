import { 
    Controller, Get, Post, Patch, Delete, Body, Param, 
    Inject
  } from '@nestjs/common';
import { BoardGameService } from './board-game.service';
import { CreateBoardGameDto, UpdateBoardGameDto } from './dto/create-board-game.dto';
import { FirebaseService } from '../firebase/firebase-service';

  
  @Controller('board-games')
  export class BoardGameController {
    constructor(@Inject(BoardGameService) private readonly boardGameService: BoardGameService,
    @Inject(FirebaseService) private readonly firebaseService: FirebaseService) {}
  
    @Post()
    create(@Body() dto: CreateBoardGameDto) {
      return this.boardGameService.create(dto);
    }
  
    @Get(":category")
    findAllInOneCategory(@Param("category") categoryName: string) {
      return this.boardGameService.findAllInOneCategory(categoryName);
    }

    @Get()
    findAll() {
      return this.boardGameService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.boardGameService.findOne(id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateBoardGameDto) {
      return this.boardGameService.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.boardGameService.remove(id);
    }

    @Delete('/deleteTagToBoardGame/:nameTag')
    removeTag(@Param('id') id: string) {
      return this.boardGameService.removeTag(id);
    }
  }
  