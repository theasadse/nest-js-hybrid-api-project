import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  IsPositive,
} from "class-validator";

export class CreatePostDto {
  @ApiProperty({ example: "My First Post", description: "Post title" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: "This is the content...",
    description: "Post content",
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: false, description: "Is post published" })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiProperty({ example: 1, description: "Author user ID" })
  @IsInt()
  @IsPositive()
  authorId: number;
}
