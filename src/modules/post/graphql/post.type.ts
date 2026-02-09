import { ObjectType, Field, Int } from '@nestjs/graphql';
import { PaginationMeta } from '../../../common/graphql';

@ObjectType()
export class AuthorType {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  name: string | null;
}

@ObjectType()
export class PostType {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  content: string | null;

  @Field()
  published: boolean;

  @Field(() => Int)
  authorId: number;

  @Field(() => AuthorType, { nullable: true })
  author?: AuthorType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedPosts {
  @Field(() => [PostType])
  data: PostType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
