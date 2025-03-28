import { 
    Controller, Get, Post, Patch, Delete, Body, Param, 
    Inject,
    UseGuards
  } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto.ts';
import { HistoryGameService } from './history-games.service';
import { UpdateHistoryGameDto } from './dto/update-board-game.dto';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard.js';
  
  @Controller('history')
  export class HistoryGameController {
    constructor(@Inject(HistoryGameService) private readonly historyGameService: HistoryGameService) {}
  
    // @Post()
    // create(@Body() dto: CreateHistoryGameDto) {
    //   return this.historyGameService.create(dto);
    // }
  
    @Get()
    findAll() {
      return this.historyGameService.findAll();
    }
     @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.historyGameService.findOne(id);
    }
   @UseGuards(JwtAuthGuard)
    @Post('createHistory/:eventId')
    async createHistory(
      @Param('eventId') eventId: string,
      @Body() createHistoryDto: CreateHistoryDto,
    ) {
      return this.historyGameService.createHistory(eventId, createHistoryDto);
    }


     @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateHistoryGameDto) {
      return this.historyGameService.update(id, dto);
    }


    @Delete('deleteAll')
    async deleteAllHistory(): Promise<void> {
      return this.historyGameService.deleteAllHistory();
    }
    
     @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.historyGameService.remove(id);
      
    }


  }
  