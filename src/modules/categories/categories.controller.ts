import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-categories.dto';
import { CategoryService } from './categories.service';
import { FilterDto } from './dto/filter-categories.dto';
import { Category } from 'entity/some.entity';

@Controller('categories')
export class CategoryController {
  constructor(@Inject(CategoryService)private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query() filters: FilterDto): Promise<Category[]> {
    return this.categoryService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
