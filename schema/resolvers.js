import { Comment } from "./resolvers/Comment.js";
import { Forum } from "./resolvers/Forum.js";
import { Mutation } from "./resolvers/Mutation.js";
import { Query } from "./resolvers/Query.js";
import { Topic } from "./resolvers/Topic.js";
import { User } from "./resolvers/User.js";

export const resolvers = {
  Comment,
  Forum,
  Mutation,
  Query,
  Topic,
  User
};
