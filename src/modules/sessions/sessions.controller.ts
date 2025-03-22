import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionsService } from './sessions.service';
import { Session } from 'entity/some.entity';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';

@Controller('sessions')
export class SessionsController {
  constructor(@Inject(SessionsService)private readonly sessionService: SessionsService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto) {
    console.log(createSessionDto);
    return this.sessionService.create(createSessionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-sessions')
  async findMySessions(
    @Query('search') sessionName?: string,
    @Query('status') status?: string,
    @Query('date') date?: string, 
  ): Promise<Session[]> {
    const userId = "295d6bfb-0bcc-4151-acb9-af3fa6fc8c04";
    return await this.sessionService.findMySessions(userId, status, sessionName, date);
  }
  @UseGuards(JwtAuthGuard)
  @Get('myCreated-sessions')
  async findMyCreatedSessions(
    @Request() req,
    @Query('search') sessionName?: string,
    @Query('status') status?: string,
    @Query('date') date?: string, 
  ): Promise<Session[]> {
    console.log(req.user);
    const userId = req.user.id;
    return await this.sessionService.findMySessions(userId, status, sessionName, date);
  }

  @Get(':boardGame')
  async findAll(@Param("boardGame") boardGameName: string) {
    console.log(boardGameName);
    const sessions = await this.sessionService.findAll(boardGameName);
    console.log(sessions);
    return sessions ;
  }
  @UseGuards(JwtAuthGuard)
  @Get('/details/:id') 
  async findOne(@Param('id') id: string) {
    console.log("details");
    const sessions =  [await this.sessionService.findOneById(id)];
    console.log(sessions);
    return sessions ;
  }

  @Get('')    
  findAllL() {
    console.log("findAllL");
    return this.sessionService.findAlll();
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionService.update(id, updateSessionDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionService.remove(id);
  }
}