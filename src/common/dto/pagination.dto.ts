import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsPositive, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { PAGINATION_DEFAULTS } from "../constants";

export class PaginationDto {
  @ApiPropertyOptional({ example: 1, description: "Page number" })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = PAGINATION_DEFAULTS.page;

  @ApiPropertyOptional({ example: 10, description: "Items per page" })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = PAGINATION_DEFAULTS.limit;

  @ApiPropertyOptional({ description: "Search query" })
  @IsOptional()
  @IsString()
  search?: string;
}
