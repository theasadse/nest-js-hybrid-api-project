import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, MaxLength, Matches } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Technology',
    description: 'Unique category name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated description',
    description: 'Category description',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: '#10B981',
    description: 'Hex color code',
  })
  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color must be a valid hex color',
  })
  color?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Active status',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
