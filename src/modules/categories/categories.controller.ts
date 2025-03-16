import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-categories.dto';
import { CategoryService } from './categories.service';
import { FilterDto } from './dto/filter-categories.dto';
import { Category } from 'entity/some.entity';
import { CreateTagForCategoryDto } from 'modules/entities/dto/entities.dto';

@Controller('categories')
export class CategoryController {
  constructor(@Inject(CategoryService)private readonly categoryService: CategoryService,
) {}

  @Post("/addCategory")
  addCategory(@Body() createCategoryDto: CreateCategoryDto) {
    console.log(createCategoryDto);
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

  @Patch('/updateCategory/:id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    console.log(updateCategoryDto.tags);
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete('/deleteCategory/:id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }

  @Post('/addTagToCategory')
  addTag(@Body() tagName: CreateTagForCategoryDto) {

    return this.categoryService.addTagToCategory(tagName.tag);
  }

  @Delete('/deleteTagToCategory/:nameTag')
  removeTag(@Param('id') id: string) {
    return this.categoryService.removeTag(id);
  }
}
