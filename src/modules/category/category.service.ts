/**
 * ============================================================
 * CATEGORY SERVICE - SHARED BY BOTH REST AND GRAPHQL
 * ============================================================
 *
 * 🔑 KEY CONCEPT: The Service layer contains all business logic
 * and is SHARED by both REST Controllers and GraphQL Resolvers.
 *
 * ✅ SAME Prisma instance is used for both REST and GraphQL
 * ✅ No duplicate database logic
 * ✅ Single source of truth for business rules
 *
 * ============================================================
 */

import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Category, Prisma } from '@prisma/client';

// Define the type for Category with posts count
const categoryWithPosts = Prisma.validator<Prisma.CategoryDefaultArgs>()({
  include: { posts: { select: { id: true, title: true } } },
});

type CategoryWithPosts = Prisma.CategoryGetPayload<typeof categoryWithPosts>;

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface QueryCategoryData {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  /**
   * 🔑 SAME PrismaService injected here is used by:
   *    - CategoryController (REST)
   *    - CategoryResolver (GraphQL)
   *
   * Prisma is NOT duplicated - it's a single shared instance!
   */
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // CREATE - Used by both REST and GraphQL
  // ============================================================
  async create(data: CreateCategoryData): Promise<Category> {
    this.logger.log(`Creating category: ${data.name}`);

    // Check if category name already exists
    const existing = await this.prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException(`Category "${data.name}" already exists`);
    }

    return this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || '#3B82F6',
      },
    });
  }

  // ============================================================
  // FIND ALL - Used by both REST and GraphQL
  // ============================================================
  async findAll(query: QueryCategoryData = {}): Promise<PaginatedResult<Category>> {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================
  // FIND ONE - Used by both REST and GraphQL
  // ============================================================
  async findOne(id: number): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  // ============================================================
  // FIND BY NAME - REST ONLY (example of REST-specific method)
  // ============================================================
  async findByName(name: string): Promise<Category | null> {
    this.logger.log(`[REST ONLY] Finding category by name: ${name}`);
    return this.prisma.category.findUnique({
      where: { name },
    });
  }

  // ============================================================
  // FIND WITH POSTS - GRAPHQL ONLY (uses relation loading)
  // ============================================================
  async findWithPosts(id: number): Promise<CategoryWithPosts> {
    this.logger.log(`[GRAPHQL ONLY] Finding category with posts: ${id}`);

    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  // ============================================================
  // UPDATE - Used by both REST and GraphQL
  // ============================================================
  async update(id: number, data: UpdateCategoryData): Promise<Category> {
    await this.findOne(id); // Verify exists

    // If name is being updated, check for duplicates
    if (data.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          name: data.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Category "${data.name}" already exists`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  // ============================================================
  // DELETE - Used by both REST and GraphQL
  // ============================================================
  async remove(id: number): Promise<void> {
    await this.findOne(id); // Verify exists

    await this.prisma.category.delete({
      where: { id },
    });
  }

  // ============================================================
  // TOGGLE ACTIVE - REST ONLY (REST-specific action)
  // ============================================================
  async toggleActive(id: number): Promise<Category> {
    this.logger.log(`[REST ONLY] Toggling active status for category: ${id}`);

    const category = await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });
  }

  // ============================================================
  // GET STATISTICS - GRAPHQL ONLY (complex aggregation)
  // ============================================================
  async getStatistics(): Promise<{
    totalCategories: number;
    activeCategories: number;
    categoriesWithPosts: number;
  }> {
    this.logger.log(`[GRAPHQL ONLY] Getting category statistics`);

    const [totalCategories, activeCategories, categoriesWithPosts] = await Promise.all([
      this.prisma.category.count(),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.category.count({
        where: {
          posts: { some: {} },
        },
      }),
    ]);

    return {
      totalCategories,
      activeCategories,
      categoriesWithPosts,
    };
  }
}
