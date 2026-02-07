import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AuthorDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  name: string | null;
}

export class PostResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'My First Post' })
  title: string;

  @ApiPropertyOptional({ example: 'This is the content...' })
  content: string | null;

  @ApiProperty({ example: false })
  published: boolean;

  @ApiProperty({ example: 1 })
  authorId: number;

  @ApiPropertyOptional({ type: AuthorDto })
  author?: AuthorDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
