import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { PaginationMeta } from '../../../common/graphql';

// Register the Prisma Role enum with GraphQL
registerEnumType(Role, {
  name: 'Role',
  description: 'User roles',
});

// Simplified post type for user's posts relation (to avoid circular dependency)
@ObjectType('UserPost')
export class UserPostType {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  published: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class UserType {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => Role)
  role: Role;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [UserPostType], { nullable: true })
  posts?: UserPostType[];
}

@ObjectType()
export class PaginatedUsers {
  @Field(() => [UserType])
  data: UserType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
