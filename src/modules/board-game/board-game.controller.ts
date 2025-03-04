import { 
    Controller, Get, Post, Patch, Delete, Body, Param, 
    Inject
  } from '@nestjs/common';
import { BoardGameService } from './board-game.service';
import { CreateBoardGameDto, UpdateBoardGameDto } from './dto/create-board-game.dto';

  
  @Controller('board-games')
  export class BoardGameController {
    constructor(@Inject(BoardGameService) private readonly boardGameService: BoardGameService) {}
  
    @Post()
    create(@Body() dto: CreateBoardGameDto) {
      return this.boardGameService.create(dto);
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
  }
  