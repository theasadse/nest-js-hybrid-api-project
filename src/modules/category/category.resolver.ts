/**
 * ============================================================
 * CATEGORY RESOLVER - GRAPHQL API ONLY
 * ============================================================
 *
 * This resolver handles GraphQL queries and mutations for categories.
 * Some operations are GraphQL-specific, while others are also
 * available via REST.
 *
 * 📍 GraphQL Operations:
 *    Query  categories         - List all (also in REST)
 *    Query  category(id)       - Get one (also in REST)
 *    Query  categoryWithPosts  - 🔹 GRAPHQL ONLY
 *    Query  categoryStatistics - 🔹 GRAPHQL ONLY
 *    Mutation createCategory   - Create (also in REST)
 *    Mutation updateCategory   - Update (also in REST)
 *    Mutation deleteCategory   - Delete (also in REST)
 *
 * ============================================================
 */

import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import {
  CategoryType,
  PaginatedCategories,
  CategoryStatistics,
  CreateCategoryInput,
  UpdateCategoryInput,
  QueryCategoryInput,
} from './graphql';

@Resolver(() => CategoryType)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  // ============================================================
  // QUERIES
  // ============================================================

  /**
   * Get all categories with pagination
   * Also available via: GET /categories
   */
  @Query(() => PaginatedCategories, {
    name: 'categories',
    description: 'Get all categories with pagination (also available via REST)',
  })
  async findAll(
    @Args('query', { type: () => QueryCategoryInput, nullable: true })
    query?: QueryCategoryInput,
  ): Promise<PaginatedCategories> {
    return this.categoryService.findAll(query || {});
  }

  /**
   * Get a single category by ID
   * Also available via: GET /categories/:id
   */
  @Query(() => CategoryType, {
    name: 'category',
    description: 'Get a category by ID (also available via REST)',
  })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<CategoryType> {
    return this.categoryService.findOne(id);
  }

  /**
   * 🔹 GRAPHQL ONLY: Get category with its posts
   * NOT available via REST
   *
   * GraphQL is great for fetching related data in a single query!
   */
  @Query(() => CategoryType, {
    name: 'categoryWithPosts',
    description: '🔹 GRAPHQL ONLY: Get category with its posts included',
  })
  async findWithPosts(@Args('id', { type: () => Int }) id: number): Promise<CategoryType> {
    return this.categoryService.findWithPosts(id);
  }

  /**
   * 🔹 GRAPHQL ONLY: Get category statistics
   * NOT available via REST
   *
   * GraphQL is great for aggregated queries!
   */
  @Query(() => CategoryStatistics, {
    name: 'categoryStatistics',
    description: '🔹 GRAPHQL ONLY: Get category statistics',
  })
  async getStatistics(): Promise<CategoryStatistics> {
    return this.categoryService.getStatistics();
  }

  // ============================================================
  // MUTATIONS
  // ============================================================

  /**
   * Create a new category
   * Also available via: POST /categories
   */
  @Mutation(() => CategoryType, {
    description: 'Create a new category (also available via REST)',
  })
  async createCategory(@Args('input') input: CreateCategoryInput): Promise<CategoryType> {
    return this.categoryService.create(input);
  }

  /**
   * Update a category
   * Also available via: PATCH /categories/:id
   */
  @Mutation(() => CategoryType, {
    description: 'Update a category (also available via REST)',
  })
  async updateCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCategoryInput,
  ): Promise<CategoryType> {
    return this.categoryService.update(id, input);
  }

  /**
   * Delete a category
   * Also available via: DELETE /categories/:id
   */
  @Mutation(() => Boolean, {
    description: 'Delete a category (also available via REST)',
  })
  async deleteCategory(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    await this.categoryService.remove(id);
    return true;
  }
}
