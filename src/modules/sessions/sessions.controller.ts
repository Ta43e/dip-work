import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionsService } from './sessions.service';
import { Session } from 'entity/some.entity';

@Controller('sessions')
export class SessionsController {
  constructor(@Inject(SessionsService)private readonly sessionService: SessionsService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto) {
    
    return this.sessionService.create(createSessionDto);
  }

  @Get('my-sessions')
  async findMySessions(
    @Query('search') place?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ): Promise<Session[]> {
    const userId = "295d6bfb-0bcc-4151-acb9-af3fa6fc8c04";
    return await this.sessionService.findMySessions(userId, status, place, date);
  }

  @Get()
  findAll() {
    return this.sessionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionService.update(id, updateSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionService.remove(id);
  }


}