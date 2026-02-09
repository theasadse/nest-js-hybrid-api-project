/**
 * ============================================================
 * CATEGORY GRAPHQL INPUTS
 * ============================================================
 *
 * @InputType() - Defines input types for GraphQL mutations
 * These are the shapes of data sent TO resolvers.
 *
 * Note: These are similar to REST DTOs but with GraphQL decorators
 *
 * ============================================================
 */

import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
} from 'class-validator';

@InputType({ description: 'Input for creating a new category' })
export class CreateCategoryInput {
  @Field({ description: 'Unique category name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field({ nullable: true, description: 'Category description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @Field({ nullable: true, description: 'Hex color code (e.g., #3B82F6)' })
  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color must be a valid hex color (e.g., #3B82F6)',
  })
  color?: string;
}

@InputType({ description: 'Input for updating a category' })
export class UpdateCategoryInput {
  @Field({ nullable: true, description: 'Unique category name' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @Field({ nullable: true, description: 'Category description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @Field({ nullable: true, description: 'Hex color code' })
  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color must be a valid hex color',
  })
  color?: string;

  @Field({ nullable: true, description: 'Active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType({ description: 'Query parameters for listing categories' })
export class QueryCategoryInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field({ nullable: true, description: 'Search in name and description' })
  @IsString()
  @IsOptional()
  search?: string;

  @Field({ nullable: true, description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
