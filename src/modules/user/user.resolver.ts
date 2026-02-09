import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  UserType,
  PaginatedUsers,
  CreateUserInput,
  UpdateUserInput,
  QueryUserInput,
} from './graphql';

@Resolver(() => UserType)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // ============ QUERIES ============

  @Query(() => PaginatedUsers, { name: 'users', description: 'Get all users with pagination' })
  async findAll(
    @Args('query', { type: () => QueryUserInput, nullable: true })
    query?: QueryUserInput,
  ): Promise<PaginatedUsers> {
    return this.userService.findAll(query || {});
  }

  @Query(() => UserType, { name: 'user', description: 'Get a user by ID' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<UserType> {
    return this.userService.findOne(id);
  }

  // ============ MUTATIONS ============

  @Mutation(() => UserType, { description: 'Create a new user' })
  async createUser(@Args('input') input: CreateUserInput): Promise<UserType> {
    return this.userService.create(input);
  }

  @Mutation(() => UserType, { description: 'Update an existing user' })
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserType> {
    return this.userService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Delete a user' })
  async deleteUser(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    await this.userService.remove(id);
    return true;
  }
}
