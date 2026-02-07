import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsBoolean, IsInt, IsPositive } from "class-validator";
import { Type, Transform } from "class-transformer";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryPostDto extends PaginationDto {
  @ApiPropertyOptional({ description: "Filter by published status" })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: "Filter by author ID" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  authorId?: number;
}
