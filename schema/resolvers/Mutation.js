import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

import isEmail from "validator/lib/isEmail.js";
import isStrongPassword from "validator/lib/isStrongPassword.js";

import { createIndex } from "./../../utils/createIndex.js";
import { createSlug } from "./../../utils/createSlug.js";
import { createToken } from "./../../utils/createToken.js";
import {
  formatStringAndKeepCase,
  formatStringAndLowerCase,
} from "./../../utils/formatString.js";

import User from "./../../models/User.js";
import Forum from "./../../models/Forum.js";
import Topic from "./../../models/Topic.js";
import Comment from "./../../models/Comment.js";

const Mutation = {
  createUser: async function (parent, args) {
    let { displayName, email, password } = args;

    let index, username, slug, path;

    const users = await User.find({}).sort({ index: 1 });
    index = createIndex(index, users);

    displayName = formatStringAndKeepCase(displayName);

    username = displayName.toLowerCase();
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return new Error("Username and/or email already in use!");

    slug = createSlug(index, username);
    path = `/profile/${slug}`;

    if (!isEmail(email)) return new Error("Email is not valid!");
    if (!isStrongPassword(password))
      return new Error("Password is not strong enough!");
    password = await bcryptjs.hash(password, 12);

    try {
      const user = await User.create({
        index,
        displayName,
        username,
        email,
        password,
        slug,
        path,
      });

      return user;
    } catch (error) {
      new Error(error.message);
    }
  },
  editUser: async function (parent, args) {
    let { index, displayName, email, password } = args;
    let username, slug, path;

    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id))
      return new Error("User does not exist (Invalid ID)!");

    const user = await User.findById(_id);
    if (!user) return new Error("User does not exist!");

    if (index !== user.index) {
      const users = await User.find({}).sort({ index: 1 });
      index = index ? createIndex(index, users) : user.index;
      if (index === user.index) index = user.index;
    } else {
      index = user.index;
    }

    displayName = formatStringAndKeepCase(displayName);

    username = displayName.toLowerCase();

    slug = createSlug(index, username);
    path = `/profile/${slug}`;

    if (!isEmail(email)) return new Error("Email is not valid!");
    if (!isStrongPassword(password))
      return new Error("Password is not strong enough!");
    password = await bcryptjs.hash(password, 12);

    try {
      const editedUser = await User.findByIdAndUpdate(
        _id,
        {
          index,
          displayName,
          username,
          email,
          password,
          slug,
          path,
        },
        { new: true }
      );

      return editedUser;
    } catch (error) {
      if (error.message.includes("E11000"))
        return new Error("Username and/or email already taken!");
      new Error(error.message);
    }
  },
  removeUser: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("User does not exist (Invalid ID)!");
    }

    const user = await User.findById(_id);
    if (!user) return new Error("User does not exist!");

    try {
      const removedUser = await User.findByIdAndRemove(_id);

      await Comment.deleteMany({ userId: _id });
      await Topic.deleteMany({ userId: _id });

      return removedUser;
    } catch (error) {
      new Error(error.message);
    }
  },
  removeAllUsers: async function (parent, args) {
    try {
      await Comment.deleteMany({});
      await Topic.deleteMany({});

      const removedUsers = await User.deleteMany({});

      return removedUsers.acknowledged;
    } catch (error) {
      new Error(error.message);
    }
  },

  createForum: async function (parent, args) {
    let { index, title, description } = args;

    const forums = await Forum.find({}).sort({ index: 1 });
    index = createIndex(index, forums);

    const exists = await Forum.findOne({ title });
    if (exists) return new Error("Title already in use!");

    const slug = createSlug(index, formatStringAndLowerCase(title));
    const path = `/forum/${slug}`;

    try {
      const forum = await Forum.create({
        index,
        title,
        description,
        slug,
        path,
      });

      return forum;
    } catch (error) {
      new Error(error.message);
    }
  },
  editForum: async function (parent, args) {
    let { index, title, description } = args;
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Forum does not exist (Invalid ID)!");
    }

    const forum = await Forum.findById(_id);
    if (!forum) return new Error("Forum does not exist!");

    if (index !== forum.index) {
      const forums = await Forum.find({}).sort({ index: 1 });
      index = index ? createIndex(index, forums) : forum.index;
      if (index === forum.index) index = forum.index;
    } else {
      index = forum.index;
    }

    const slug = createSlug(index, formatStringAndLowerCase(title));
    const path = `/forum/${slug}`;

    try {
      const editedForum = await Forum.findByIdAndUpdate(
        _id,
        { index, title, description, slug, path },
        { new: true }
      );

      return editedForum;
    } catch (error) {
      if (error.message.includes("E11000"))
        return new Error("Title already taken!");
      new Error(error.message);
    }
  },
  removeForum: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Forum does not exist (Invalid ID)!");
    }

    const forum = await Forum.findById(_id);
    if (!forum) return new Error("Forum does not exist!");

    try {
      const removedForum = await Forum.findByIdAndRemove(_id);

      await Comment.deleteMany({ forumId: _id });
      await Topic.deleteMany({ forumId: _id });

      return removedForum;
    } catch (error) {
      new Error(error.message);
    }
  },
  removeAllForums: async function (parent, args) {
    try {
      await Comment.deleteMany({});
      await Topic.deleteMany({});

      const removedForums = await Forum.deleteMany({});

      return removedForums.acknowledged;
    } catch (error) {
      new Error(error.message);
    }
  },

  createTopic: async function (parent, args) {
    let { index, title, type, forumId, userId } = args;
    if (!mongoose.Types.ObjectId.isValid(forumId))
      return new Error("Forum does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(userId))
      return new Error("User does not exist (Invalid ID)!");

    const forum = await Forum.findById(forumId);
    if (!forum) return new Error("Forum does not exist!");
    const user = await User.findById(userId);
    if (!user) return new Error("User does not exist!");

    if (type === "THREAD") {
      const threads = await Topic.find({ type: "THREAD" }).sort({ index: 1 });
      index = createIndex(index, threads);
    }
    if (type === "CHAT") {
      const chats = await Topic.find({ type: "CHAT" }).sort({ index: 1 });
      index = createIndex(index, chats);
    }

    const slug = createSlug(index, formatStringAndLowerCase(title));
    const path = `/topic/${slug}`;

    try {
      const topic = await Topic.create({
        index,
        title,
        type,
        forumId,
        userId,
        slug,
        path,
      });

      return topic;
    } catch (error) {
      new Error(error.message);
    }
  },
  editTopic: async function (parent, args) {
    let { index, title, forumId } = args;
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id))
      return new Error("Topic does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(forumId))
      return new Error("Forum does not exist (Invalid ID)!");

    const topic = await Topic.findById(_id);
    if (!topic) return new Error("Topic does not exist!");
    const forum = await Forum.findById(forumId);
    if (!forum) return new Error("Forum does not exist!");

    if (index !== topic.index) {
      const topics = await Topic.find({}).sort({ index: 1 });
      index = index ? createIndex(index, topics) : topic.index;
      if (index === topic.index) index = topic.index;
    } else {
      index = topic.index;
    }

    const slug = createSlug(index, formatStringAndLowerCase(title));
    const path = `/topic/${slug}`;

    try {
      const editedTopic = await Topic.findByIdAndUpdate(
        _id,
        { index, title, forumId, slug, path },
        { new: true }
      );

      return editedTopic;
    } catch (error) {
      new Error(error.message);
    }
  },
  removeTopic: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Topic does not exist (Invalid ID)!");
    }

    const topic = await Topic.findById(_id);
    if (!topic) return new Error("Topic does not exist!");

    try {
      await Comment.deleteMany({ topicId: _id });

      const removedTopic = await Topic.findByIdAndRemove(_id);

      return removedTopic;
    } catch (error) {
      new Error(error.message);
    }
  },
  removeAllTopics: async function (parent, args) {
    try {
      await Comment.deleteMany({});

      const removedTopics = await Topic.deleteMany({});

      return removedTopics.acknowledged;
    } catch (error) {
      new Error(error.message);
    }
  },

  createComment: async function (parent, args) {
    let { content, type, forumId, topicId, userId } = args;
    if (!mongoose.Types.ObjectId.isValid(forumId))
      return new Error("Forum does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(topicId))
      return new Error("Topic does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(userId))
      return new Error("User does not exist (Invalid ID)!");

    const forum = await Forum.findById(forumId);
    if (!forum) return new Error("Forum does not exist!");
    const topic = await Topic.findById(topicId);
    if (!topic) return new Error("Topic does not exist!");
    const user = await User.findById(userId);
    if (!user) return new Error("User does not exist!");

    let index;

    if (type === "POST") {
      const posts = await Comment.find({ type: "POST" }).sort({ index: 1 });
      index = createIndex(index, posts);
    }
    if (type === "MESSAGE") {
      const messages = await Comment.find({ type: "MESSAGE" }).sort({
        index: 1,
      });
      index = createIndex(index, messages);
    }

    try {
      const comment = await Comment.create({
        index,
        content,
        type,
        forumId,
        topicId,
        userId,
      });

      return comment;
    } catch (error) {
      new Error(error.message);
    }
  },
  editComment: async function (parent, args) {
    let { index, content, forumId, topicId } = args;
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id))
      return new Error("Comment does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(forumId))
      return new Error("Forum does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(topicId))
      return new Error("Forum does not exist (Invalid ID)!");

    const comment = await Comment.findById(_id);
    if (!comment) return new Error("Comment does not exist!");
    const forum = await Forum.findById(forumId);
    if (!forum) return new Error("Forum does not exist!");
    const topic = await Topic.findById(topicId);
    if (!topic) return new Error("Topic does not exist!");

    if (index !== comment.index) {
      const comments = await Comment.find({}).sort({ index: 1 });
      index = index ? createIndex(index, comments) : comment.index;
      if (index === comment.index) index = comment.index;
    } else {
      index = comment.index;
    }

    try {
      const editedComment = await Comment.findByIdAndUpdate(
        _id,
        { index, content, forumId, topicId },
        { new: true }
      );

      return editedComment;
    } catch (error) {
      new Error(error.message);
    }
  },
  removeComment: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Comment does not exist (Invalid ID)!");
    }

    const comment = await Comment.findById(_id);
    if (!comment) return new Error("Comment does not exist!");

    try {
      const removedComment = await Comment.findByIdAndRemove(_id);

      return removedComment;
    } catch (error) {
      new Error(error.message);
    }
  },
  removeAllComments: async function (parent, args) {
    try {
      await Topic.deleteMany({});

      const removedComments = await Comment.deleteMany({});

      return removedComments.acknowledged;
    } catch (error) {
      new Error(error.message);
    }
  },

  createTopicWithComment: async function (parent, args) {
    let { topicType, commentType, title, content, forumId, userId } = args;
    if (!mongoose.Types.ObjectId.isValid(forumId))
      return new Error("Forum does not exist (Invalid ID)");
    if (!mongoose.Types.ObjectId.isValid(userId))
      return new Error("User does not exist (Invalid ID)");

    const forum = await Forum.findById(forumId);
    if (!forum) return new Error("Forum does not exist");
    const user = await User.findById(userId);
    if (!user) return new Error("User does not exist");

    let topicIndex, commentIndex, slug, path;
    if (topicType === "THREAD") {
      const threads = await Topic.find({ type: "THREAD" }).sort({ index: 1 });
      topicIndex = createIndex(topicIndex, threads);
      slug = createSlug(topicIndex, formatStringAndLowerCase(title));
      path = `/topic/${slug}`;
      const posts = await Comment.find({ type: "POST" }).sort({ index: 1 });
      commentIndex = createIndex(commentIndex, posts);
    }
    if (topicType === "CHAT") {
      const chats = await Topic.find({ type: "CHAT" }).sort({ index: 1 });
      topicIndex = createIndex(topicIndex, chats);
      slug = createSlug(topicIndex, formatStringAndLowerCase(title));
      path = `/messenger/${slug}`;
      const messages = await Comment.find({ type: "MESSAGE" }).sort({
        index: 1,
      });
      commentIndex = createIndex(commentIndex, messages);
    }

    try {
      const topic = await Topic.create({
        index: topicIndex,
        type: topicType,
        title,
        forumId,
        userId,
        slug,
        path,
      });
      const comment = await Comment.create({
        index: commentIndex,
        type: commentType,
        content,
        forumId,
        topicId: String(topic._id),
        userId,
      });

      return topic;
    } catch (error) {
      new Error(error.message);
    }
  },

  login: async function (parent, args, ctx) {
    const { displayName, email, password } = args;

    // let username = formatStringAndLowerCase(displayName);
    const user = await User.findOne({
      $or: [{ displayName }, { email }],
    });
    if (!user)
      return new Error(
        "User does not exist. Make sure you're entering the correct credentials."
      );
    const match = await bcryptjs.compare(password, user.password);
    if (!match) return new Error("Password is incorrect");
    try {
    	const token = createToken(user._id);
	    ctx.res.setHeader("Set-Cookie", `authorization=${token}; path=/; Max-Age=360000`);
      // user.token = token;
	    // console.log(Object.keys(ctx.res))
	    // console.log(ctx.req.cookies)
	    // , {maxAge: 1000*60*60*24}
      // ctx.res.setHeader("authorization", createToken(user._id));
	    // console.log(ctx.res.req.headers);
	    // console.log(Object.keys(ctx.req))
	    // console.log(Object.keys(ctx.res))
	    // ctx.res.cookie("jwt", createToken(user._id));
	    // console.log(Object.keys(ctx));
	    // console.log(user);

      // ctx.token = user.token = createToken(String(user._id));
      // await user.save();
    // console.log(ctx.res);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  signup: async function (parent, args, ctx) {
    let { displayName, email, password } = args;

    let index, username, slug, path;

    const users = await User.find({}).sort({ index: 1 });
    index = createIndex(index, users);

    displayName = formatStringAndKeepCase(displayName);

    username = displayName.toLowerCase();
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return new Error("Username and/or email already in use!");

    slug = createSlug(index, username);
    path = `/profile/${slug}`;

    if (!isEmail(email)) return new Error("Email is not valid!");
    if (!isStrongPassword(password))
      return new Error("Password is not strong enough!");
    password = await bcryptjs.hash(password, 12);

    try {
      const user = await User.create({
        index,
        displayName,
        username,
        email,
        password,
        slug,
        path,
      });

      const token = createToken(user._id);
      ctx.res.setHeader("Set-Cookie", `authorization=${token}; path=/; Max-Age=360000`);

      return user;
    } catch (error) {
      new Error(error.message);
    }
  },
};

export { Mutation };
