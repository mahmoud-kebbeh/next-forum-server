import mongoose from "mongoose";

import User from "./../../models/User.js";
import Forum from "./../../models/Forum.js";
import Topic from "./../../models/Topic.js";
import Comment from "./../../models/Comment.js";

const Query = {
  users: async function (parent, args) {
    const { usersLimit } = args;
    if (usersLimit) {
      return await User.find({}).sort({ index: -1 }).limit(usersLimit);
    }
    const users = await User.find({}).sort({ index: 1 });

    return users;
  },
  user: async function (parent, args) {
    const { _id, index, displayName, username, email } = args;
    if (!mongoose.Types.ObjectId.isValid(_id))
      return new Error("User does not exist (Invalid ID)");

    const user = await User.findOne({
      $or: [{ _id }, { index }, { displayName }, { username }, { email }],
    });
    if (!user) return new Error("User does not exist");

    return user;
  },

  forums: async function (parent, args, ctx) {
    const { forumsLimit } = args;
    if (forumsLimit) {
      return await Forum.find({}).sort({ index: -1 }).limit(forumsLimit);
    }
    const forums = await Forum.find({}).sort({ index: 1 });
    
    return forums;
  },
  forum: async function (parent, args) {
    const { _id, index, title } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Forum does not exist (Invalid ID)");
    }

    const forum = await Forum.findOne({ $or: [{ _id }, { index }, { title }] });
    if (!forum) return new Error("Forum does not exist");

    return forum;
  },

  topics: async function (parent, args) {
    const { topicsLimit } = args;
    if (topicsLimit) {
      return await Topic.find({}).sort({ index: -1 }).limit(topicsLimit);
    }
    const topics = await Topic.find({}).sort({ index: 1 });

    return topics;
  },
  topic: async function (parent, args) {
    const { _id, index } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Topic does not exist (Invalid ID)");
    }

    const topic = await Topic.findOne({ $or: [{ _id }, { index }] });
    if (!topic) return new Error("Topic does not exist");

    return topic;
  },

  comments: async function (parent, args) {
    const { commentsLimit } = args;
    if (commentsLimit) {
      return await Comment.find({}).sort({ index: -1 }).limit(commentsLimit);
    }

    const comments = await Comment.find({}).sort({ index: -1 });

    return comments;
  },
  comment: async function (parent, args) {
    const { _id, index } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Comment does not exist (Invalid ID)");
    }

    const comment = await Comment.findOne({ $or: [{ _id }, { index }] });
    if (!comment) return new Error("Comment does not exist");

    return comment;
  },
};

export { Query };
