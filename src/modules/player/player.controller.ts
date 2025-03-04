import {
  Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
  } from '@nestjs/common';
  import { PlayerService } from './player.service';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
  
  @Controller('players')
  export class PlayerController {
    constructor(@Inject(PlayerService )private readonly playersService: PlayerService) {}
  
    @Post()
    create(@Body() createPlayerDto: CreatePlayerDto) {
      return this.playersService.create(createPlayerDto);
    }
  
    @Get()
    findAll() {
      return this.playersService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.playersService.findOne(id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePlayerDto: UpdatePlayerDto) {
      return this.playersService.update(id, updatePlayerDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.playersService.remove(id);
    }
  }
  