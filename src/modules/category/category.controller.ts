/**
 * ============================================================
 * CATEGORY CONTROLLER - REST API ONLY
 * ============================================================
 *
 * This controller handles REST API endpoints for categories.
 * Some endpoints are REST-only specific, while others are
 * also available via GraphQL.
 *
 * 📍 REST Endpoints:
 *    POST   /categories         - Create (also in GraphQL)
 *    GET    /categories         - List all (also in GraphQL)
 *    GET    /categories/:id     - Get one (also in GraphQL)
 *    GET    /categories/name/:name - 🔸 REST ONLY
 *    PATCH  /categories/:id     - Update (also in GraphQL)
 *    DELETE /categories/:id     - Delete (also in GraphQL)
 *    PATCH  /categories/:id/toggle-active - 🔸 REST ONLY
 *
 * ============================================================
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from './dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // ============================================================
  // CREATE CATEGORY - Available in both REST and GraphQL
  // ============================================================
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  // ============================================================
  // GET ALL CATEGORIES - Available in both REST and GraphQL
  // ============================================================
  @Get()
  @ApiOperation({ summary: 'Get all categories with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(@Query() query: QueryCategoryDto) {
    return this.categoryService.findAll(query);
  }

  // ============================================================
  // 🔸 REST ONLY: GET CATEGORY BY NAME
  // This endpoint is NOT available in GraphQL
  // ============================================================
  @Get('name/:name')
  @ApiOperation({
    summary: '🔸 REST ONLY: Get category by name',
    description: 'This endpoint is specific to REST API and not available in GraphQL',
  })
  @ApiParam({ name: 'name', description: 'Category name' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findByName(@Param('name') name: string) {
    const category = await this.categoryService.findByName(name);
    if (!category) {
      throw new NotFoundException(`Category "${name}" not found`);
    }
    return category;
  }

  // ============================================================
  // GET ONE CATEGORY - Available in both REST and GraphQL
  // ============================================================
  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  // ============================================================
  // UPDATE CATEGORY - Available in both REST and GraphQL
  // ============================================================
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  // ============================================================
  // DELETE CATEGORY - Available in both REST and GraphQL
  // ============================================================
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.remove(id);
  }

  // ============================================================
  // 🔸 REST ONLY: TOGGLE ACTIVE STATUS
  // This endpoint is NOT available in GraphQL
  // ============================================================
  @Patch(':id/toggle-active')
  @ApiOperation({
    summary: '🔸 REST ONLY: Toggle category active status',
    description: 'This action-based endpoint is specific to REST API patterns',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.toggleActive(id);
  }
}
