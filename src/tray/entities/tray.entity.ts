import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Tray {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String)
  userId: string;

  @Field(() => [String])
  plants: string[];
}
