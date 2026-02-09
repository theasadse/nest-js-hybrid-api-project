/**
 * ============================================================
 * CATEGORY GRAPHQL TYPES
 * ============================================================
 *
 * @ObjectType() - Defines output types for GraphQL queries
 * These are the shapes of data returned from resolvers.
 *
 * ============================================================
 */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { PaginationMeta } from '../../../common/graphql';

@ObjectType()
export class CategoryPostType {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;
}

@ObjectType()
export class CategoryType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  color: string | null;

  @Field()
  isActive: boolean;

  @Field(() => [CategoryPostType], { nullable: true })
  posts?: CategoryPostType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedCategories {
  @Field(() => [CategoryType])
  data: CategoryType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

// 🔸 GRAPHQL ONLY: Statistics type
@ObjectType({ description: '🔸 GRAPHQL ONLY: Category statistics' })
export class CategoryStatistics {
  @Field(() => Int, { description: 'Total number of categories' })
  totalCategories: number;

  @Field(() => Int, { description: 'Number of active categories' })
  activeCategories: number;

  @Field(() => Int, { description: 'Categories that have posts' })
  categoriesWithPosts: number;
}
