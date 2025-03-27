import {
  Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Request,
    UseGuards
  } from '@nestjs/common';
  import { PlayerService } from './player.service';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
  
  @Controller('players')
  export class PlayerController {
    constructor(@Inject(PlayerService )private readonly playersService: PlayerService) {}
   
    @UseGuards(JwtAuthGuard)
    @Post("record")
    create(@Body() createPlayerDto: CreatePlayerDto, @Request() req) {
      return this.playersService.create( req.user.id, createPlayerDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/unrecord/:id')
    async unrecord(@Param('id') participantId: string) {
      return this.playersService.remove(participantId);
    }
  
    @Get()
    findAll() {
      return this.playersService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.playersService.findOne(id);
    }
  
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePlayerDto: UpdatePlayerDto) {
      return this.playersService.update(id, updatePlayerDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
      console.log(id);
      return this.playersService.remove(id);
    }
  }
  