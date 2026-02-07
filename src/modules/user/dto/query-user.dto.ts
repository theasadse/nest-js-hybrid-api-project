import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsPositive, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional({ description: "Search by email or name" })
  @IsOptional()
  @IsString()
  search?: string;
}
