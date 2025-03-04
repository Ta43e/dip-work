import { 
    Controller, Get, Post, Patch, Delete, Body, Param, 
    Inject
  } from '@nestjs/common';
import { CreateHistoryGameDto } from './dto/create-board-game.dto';
import { HistoryGameService } from './history-games.service';
import { UpdateHistoryGameDto } from './dto/update-board-game.dto';
  
  @Controller('history-games')
  export class HistoryGameController {
    constructor(@Inject(HistoryGameService) private readonly historyGameService: HistoryGameService) {}
  
    @Post()
    create(@Body() dto: CreateHistoryGameDto) {
      return this.historyGameService.create(dto);
    }
  
    @Get()
    findAll() {
      return this.historyGameService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.historyGameService.findOne(id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateHistoryGameDto) {
      return this.historyGameService.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.historyGameService.remove(id);
    }
  }
  