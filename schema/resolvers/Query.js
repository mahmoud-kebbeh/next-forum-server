import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";

import User from "./../../models/User.js";
import Forum from "./../../models/Forum.js";
import Topic from "./../../models/Topic.js";
import Comment from "./../../models/Comment.js";

export const Query = {
  users: async function (parent, args) {
    const { usersLimit, hidden, sort } = args;

    const users = await User.find({ hidden: hidden === true ? true : hidden === false ? false : { $exists: true } }).sort({ createdAt: sort === "ASC" ? 1 : sort === "DESC" ? -1 : 1 }).limit(`${usersLimit ? usersLimit : 0}`);

    return users;
  },
  user: async function (parent, args) {
    const { _id, slug } = args;
    if (_id) {
      if (!mongoose.Types.ObjectId.isValid(_id))
      return new Error("User does not exist (Invalid ID)!");
    }

    const user = await User.findOne({ $or: [{ _id }, { slug }] });
    if (!user) return new Error("User does not exist!");

    return user;
  },

  forums: async function (parent, args, ctx) {
    const { forumsLimit, hidden, sort } = args;

    const forums = await Forum.find({ hidden: hidden === true ? true : hidden === false ? false : { $exists: true } }).sort({ createdAt: sort === "ASC" ? 1 : sort === "DESC" ? -1 : 1 }).limit(`${forumsLimit ? forumsLimit : 0}`);
    
    return forums;
  },
  forum: async function (parent, args) {
    const { _id, slug } = args;
    if (_id) {
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return new Error("Forum does not exist (Invalid ID)!");
      }
    }

    const forum = await Forum.findOne({ $or: [{ _id }, { slug }] });
    if (!forum) return new Error("Forum does not exist!");

    return forum;
  },

  topics: async function (parent, args) {
    const { topicsLimit, hidden, sort } = args;

    const topics = await Topic.find({ hidden: hidden === true ? true : hidden === false ? false : { $exists: true } }).sort({ createdAt: sort === "ASC" ? 1 : sort === "DESC" ? -1 : 1 }).limit(`${topicsLimit ? topicsLimit : 0}`);

    return topics;
  },
  topic: async function (parent, args) {
    const { _id, slug } = args;
    if (_id) {
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return new Error("Topic does not exist (Invalid ID)!");
      }
    }

    const topic = await Topic.findOne({ $or: [{ _id }, { slug }] });
    if (!topic) return new Error("Topic does not exist!");

    return topic;
  },

  comments: async function (parent, args) {
    const { commentsLimit, hidden, sort } = args;

    const comments = await Comment.find({ hidden: hidden === true ? true : hidden === false ? false : { $exists: true } }).sort({ createdAt: sort === "ASC" ? 1 : sort === "DESC" ? -1 : 1 }).limit(`${topicsLimit ? topicsLimit : 0}`);

    return comments;
  },
  comment: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Comment does not exist (Invalid ID)!");
    }

    const comment = await Comment.findById(_id);
    if (!comment) return new Error("Comment does not exist!");

    return comment;
  },
};
