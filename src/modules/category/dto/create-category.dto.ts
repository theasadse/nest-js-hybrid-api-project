/**
 * ============================================================
 * CATEGORY REST DTOs (Data Transfer Objects)
 * ============================================================
 *
 * These DTOs are used ONLY by REST Controllers.
 * They have Swagger decorators (@ApiProperty) for API documentation.
 *
 * Note: Similar to GraphQL Inputs but with different decorators
 *
 * ============================================================
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Technology',
    description: 'Unique category name',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Posts about technology and software',
    description: 'Category description',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: '#3B82F6',
    description: 'Hex color code for the category',
  })
  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color must be a valid hex color (e.g., #3B82F6)',
  })
  color?: string;
}
