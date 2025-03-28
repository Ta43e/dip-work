import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionsService } from './sessions.service';
import { Session } from 'entity/some.entity';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';

@Controller('sessions')
export class SessionsController {
  constructor(@Inject(SessionsService)private readonly sessionService: SessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createSessionDto: CreateSessionDto, @Request() req) {
    const id = req.user.id;
    return this.sessionService.create(createSessionDto, id);
  }

  @Get('all')
  async findAllSessions(
    @Request() req,
  ): Promise<Session[]> {
    const uu  = await this.sessionService.findAlll();
    return uu;
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-sessions')
  async findMySessions(
    @Request() req,
    @Query('search') sessionName?: string,
    @Query('status') status?: string,
    @Query('date') date?: string, 
  ) {
    const userId = req.user.id;
    const uu  = await this.sessionService.findMySessions(userId, status, sessionName, date);
    return uu;
  }

  @UseGuards(JwtAuthGuard)
  @Get('myCreated-sessions')
  async findMyCreatedSessions(
    @Request() req,
    @Query('search') sessionName?: string,
    @Query('status') status?: string,
    @Query('date') date?: string, 
  ) {
    const userId = req.user.id;
    const sessions = await this.sessionService.findMyCreatedSessions(userId, status, sessionName, date);
    return sessions;
  }


  @Get(':boardGame')
  async findAll(@Param("boardGame") boardGameName: string) {
    console.log(boardGameName);
    const sessions = await this.sessionService.findAll(boardGameName);
    return sessions ;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/details/:id') 
  async findOne(@Param('id') id: string) {
    const sessions =  [await this.sessionService.findOneById(id)];
    console.log(sessions);
    return sessions ;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    console.log(updateSessionDto);
    return this.sessionService.update(id, updateSessionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/unrecord/:id')
  async unrecord(@Request() req, @Param('id') participantId: string) {
    return this.sessionService.removePlayer(participantId, req.user.id);
  }
}