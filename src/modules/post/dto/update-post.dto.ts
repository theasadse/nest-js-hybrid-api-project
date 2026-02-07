import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsBoolean } from "class-validator";

export class UpdatePostDto {
  @ApiPropertyOptional({ example: "Updated Title", description: "Post title" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: "Updated content...",
    description: "Post content",
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: true, description: "Is post published" })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
