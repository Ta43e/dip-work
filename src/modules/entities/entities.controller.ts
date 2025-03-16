import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import {
  CreateTagForCategoryDto,
  UpdateTagForCategoryDto,
  CreateSkillDto,
  UpdateSkillDto,
  CreateCustomTagDto,
  UpdateCustomTagDto,
  CreateTagForBoardGameDto,
  UpdateTagForBoardGameDto,
} from './dto/entities.dto';

@Controller('entities')
export class EntitiesController {
  constructor(@Inject(EntitiesService) private readonly entitiesService: EntitiesService) {}

  // Теги категорий
  @Get('tags')
  findAllTag() {
    return this.entitiesService.findAllTag();
  }

  
  @Post('/tags')
  createTag(@Body() tagName: CreateTagForCategoryDto) {
    console.log(tagName);
    return this.entitiesService.addTagToCategory(tagName.tag);
  }

  @Patch('tags/:id')
  updateTag(@Param('id') id: string, @Body() dto: UpdateTagForCategoryDto) {
    return this.entitiesService.updateTag(id, dto);
  }


  @Delete('/tags/:id')
  deleteTag(@Param('id') id: string) {
    return this.entitiesService.removeTag(id);
  }


  // Навыки
  @Get('skills')
  findAllSkill() {
    return this.entitiesService.findAllSkill();
  }

  @Post('skills')
  createSkill(@Body() dto: CreateSkillDto) {
    return this.entitiesService.createSkill(dto);
  }

  @Patch('skills/:id')
  updateSkill(@Param('id') id: string, @Body() dto: UpdateSkillDto) {
    return this.entitiesService.updateSkill(id, dto);
  }

  @Delete('skills/:id')
  deleteSkill(@Param('id') id: string) {
    return this.entitiesService.deleteSkill(id);
  }

  // Кастомные теги
  @Get('custom-tags')
  findAllCustomTag() {
    return this.entitiesService.findAllCustomTag();
  }

  @Post('custom-tags')
  createCustomTag(@Body() dto: CreateCustomTagDto) {
    return this.entitiesService.createCustomTag(dto);
  }

  @Patch('custom-tags/:id')
  updateCustomTag(@Param('id') id: string, @Body() dto: UpdateCustomTagDto) {
    return this.entitiesService.updateCustomTag(id, dto);
  }

  @Delete('custom-tags/:id')
  deleteCustomTag(@Param('id') id: string) {
    return this.entitiesService.deleteCustomTag(id);
  }

  // теги для игр
  @Get('tags-board-game')
  findAllTagForBoardGame() {
    return this.entitiesService.findAllTagForBoardGame();
  }

  @Post('tags-board-game')
  createTagForBoardGame(@Body() dto: CreateTagForBoardGameDto) {
    return this.entitiesService.addTagToBoardGame(dto.nameTag);
  }

  @Patch('tags-board-game/:id')
  updateTagForBoardGame(@Param('id') id: string, @Body() dto: UpdateTagForBoardGameDto) {
    return this.entitiesService.updateTagForBoardGame(id, dto);
  }

  @Delete('tags-board-game/:id')
  deleteTagForBoardGame(@Param('id') id: string) {
    return this.entitiesService.removeTagForBoardGame(id);
  }
}
