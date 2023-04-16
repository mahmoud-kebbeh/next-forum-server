import mongoose from "mongoose";
import jsonwebtoken from "jsonwebtoken";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./schema/resolvers.js";

const mongodbURI = process.env.MONGODB_URI;
const port = process.env.PORT || 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port },
  cors: {
    origin: ["*"]
  },
  context: async({req, res}) => {
    return { res }
  },
});

mongoose.set("strictQuery", false);
mongoose
  .connect(mongodbURI)
  .then(console.log(`Server ready at: ${url}`));