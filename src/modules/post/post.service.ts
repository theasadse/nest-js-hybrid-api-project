import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from '../../common/types';
import { PostResponseDto } from './dto/post-response.dto';

// Define the type for Post with Author included
const postWithAuthor = Prisma.validator<Prisma.PostDefaultArgs>()({
  include: { author: { select: { id: true, email: true, name: true } } },
});

type PostWithAuthor = Prisma.PostGetPayload<typeof postWithAuthor>;

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly authorSelect = {
    id: true,
    email: true,
    name: true,
  };

  async create(createPostDto: CreatePostDto): Promise<PostWithAuthor> {
    // Verify author exists
    const author = await this.prisma.user.findUnique({
      where: { id: createPostDto.authorId },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${createPostDto.authorId} not found`);
    }

    return this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        published: createPostDto.published ?? false,
        authorId: createPostDto.authorId,
      },
      include: {
        author: {
          select: this.authorSelect,
        },
      },
    });
  }

  async findAll(query: QueryPostDto): Promise<PaginatedResult<PostWithAuthor>> {
    const { page = 1, limit = 10, search, published, authorId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(published !== undefined && { published }),
      ...(authorId && { authorId }),
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: this.authorSelect,
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublished(): Promise<PostWithAuthor[]> {
    return this.prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: this.authorSelect,
        },
      },
    });
  }

  async findOne(id: number): Promise<PostWithAuthor> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: this.authorSelect,
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostWithAuthor> {
    await this.findOne(id); // Check if post exists

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        author: {
          select: this.authorSelect,
        },
      },
    });
  }

  async publish(id: number): Promise<PostWithAuthor> {
    await this.findOne(id); // Check if post exists

    return this.prisma.post.update({
      where: { id },
      data: { published: true },
      include: {
        author: {
          select: this.authorSelect,
        },
      },
    });
  }

  async unpublish(id: number): Promise<PostWithAuthor> {
    await this.findOne(id); // Check if post exists

    return this.prisma.post.update({
      where: { id },
      data: { published: false },
      include: {
        author: {
          select: this.authorSelect,
        },
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if post exists

    await this.prisma.post.delete({
      where: { id },
    });
  }
}
