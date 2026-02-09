import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PostService } from './post.service';
import {
  PostType,
  PaginatedPosts,
  CreatePostInput,
  UpdatePostInput,
  QueryPostInput,
} from './graphql';

@Resolver(() => PostType)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  // ============ QUERIES ============

  @Query(() => PaginatedPosts, { name: 'posts', description: 'Get all posts with pagination' })
  async findAll(
    @Args('query', { type: () => QueryPostInput, nullable: true })
    query?: QueryPostInput,
  ): Promise<PaginatedPosts> {
    return this.postService.findAll(query || {});
  }

  @Query(() => [PostType], { name: 'publishedPosts', description: 'Get all published posts' })
  async findPublished(): Promise<PostType[]> {
    return this.postService.findPublished();
  }

  @Query(() => PostType, { name: 'post', description: 'Get a post by ID' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<PostType> {
    return this.postService.findOne(id);
  }

  // ============ MUTATIONS ============

  @Mutation(() => PostType, { description: 'Create a new post' })
  async createPost(@Args('input') input: CreatePostInput): Promise<PostType> {
    return this.postService.create(input);
  }

  @Mutation(() => PostType, { description: 'Update an existing post' })
  async updatePost(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdatePostInput,
  ): Promise<PostType> {
    return this.postService.update(id, input);
  }

  @Mutation(() => PostType, { description: 'Publish a post' })
  async publishPost(@Args('id', { type: () => Int }) id: number): Promise<PostType> {
    return this.postService.publish(id);
  }

  @Mutation(() => PostType, { description: 'Unpublish a post' })
  async unpublishPost(@Args('id', { type: () => Int }) id: number): Promise<PostType> {
    return this.postService.unpublish(id);
  }

  @Mutation(() => Boolean, { description: 'Delete a post' })
  async deletePost(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    await this.postService.remove(id);
    return true;
  }
}
