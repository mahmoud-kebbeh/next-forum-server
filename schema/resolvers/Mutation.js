import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

import isEmail from "validator/lib/isEmail.js";
import isStrongPassword from "validator/lib/isStrongPassword.js";

import { formatStringAndKeepCase } from "./../../utils/formatString.js";
import { createSlug } from "./../../utils/createSlug.js";
import { createToken } from "./../../utils/createToken.js";

import User from "./../../models/User.js";
import Forum from "./../../models/Forum.js";
import Topic from "./../../models/Topic.js";
import Comment from "./../../models/Comment.js";

export const Mutation = {
  createUser: async function (parent, args) {
    let { displayName, email, password } = args;

    let index, username;

    if (!isEmail(email)) return new Error("Email is not valid!");
    if (!isStrongPassword(password))
      return new Error("Password must include at least 8 characters including lowercase letters, uppercase letters, numbers, and special characters!");
    const [ lastUser, exists, hash ] = await Promise.all([ User.find({}).sort({ index: -1 }).limit(1).select("index"), User.findOne({ $or: [{ username }, { email }] }), bcryptjs.hash(password, 12) ]);
    index = lastUser[0] ? lastUser[0].index + 1 : 1;
    if (exists) return new Error("Username and/or email already taken!");

    displayName = formatStringAndKeepCase(displayName);
    username = displayName.toLowerCase();


    const slug = createSlug(index, username);
    const path = `/profile/${slug}`;

    const roles = ["Member"];
    const permissions = ["read:own_user", "write:own_user"];

    try {
      const user = await User.create({
        index,
        displayName,
        username,
        email,
        password: hash,
        slug,
        path,
        roles,
        permissions
      });

      return user;
    } catch (error) {
      return new Error(error.message);
    }
  },
  updateUserCore: async function (parent, args) {
    let { displayName, email, password } = args;
    let username;

    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id))
      return new Error("User does not exist (Invalid ID)!");

    if (!isEmail(email)) return new Error("Email is not valid!");
    if (!isStrongPassword(password))
      return new Error("Password must include at least 8 characters including lowercase letters, uppercase letters, numbers, and special characters!");
    const [ user, hash ] = await Promise.all([User.findById(_id), bcryptjs.hash(password, 12)]);
    if (!user) return new Error("User does not exist!");

    displayName = formatStringAndKeepCase(displayName);
    username = displayName.toLowerCase();

    const slug = createSlug(user.index, username);
    const path = `/profile/${slug}`;

    try {
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          displayName,
          username,
          email,
          password: hash,
          slug,
          path,
        },
        { new: true }
      );

      return updatedUser;
    } catch (error) {
      if (error.message.includes("E11000"))
        return new Error("Username and/or email already taken!");
      return new Error(error.message);
    }
  },
  updateUserPriviliges: async function (parent, args) {
    const { _id, roles, permissions } = args;

    if (!mongoose.Types.ObjectId.isValid(_id))
      return new Error("User does not exist (Invalid ID)!");

    const user = await User.findById(_id);
    if (!user) return new Error("User does not exist!");

    try {
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          roles,
          permissions
        },
        { new: true }
      );

      return updatedUser;
    } catch (error) {
      return new Error(error.message);
    }
  },
  updateUserInfo: async function (parent, args) {
    const { _id, phoneNumber, picture, rank, signature } = args;

    if (!mongoose.Types.ObjectId.isValid(_id))
      return new Error("User does not exist (Invalid ID)!");

    const user = await User.findById(_id);
    if (!user) return new Error("User does not exist!");

    try {
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          phoneNumber,
          picture,
          rank,
          signature
        },
        { new: true }
      );

      return updatedUser;
    } catch (error) {
      return new Error(error.message);
    }
  },
  toggleHideUser: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("User does not exist (Invalid ID)!");
    }

    const user = await User.findById(_id);
    if (!user) return new Error("User does not exist!");

    try {
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          hidden: !user.hidden
        },
        { new: true }
      );

      return updatedUser ? true : false;
    } catch (error) {
      return new Error(error.message);
    }
  },
  toggleBanUser: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("User does not exist (Invalid ID)!");
    }

    const user = await User.findById(_id);
    if (!user) return new Error("User does not exist!");

    try {
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
          banned: !user.banned
        },
        { new: true }
      );

      return updatedUser ? true : false;
    } catch (error) {
      return new Error(error.message);
    }
  },
  toggleFollowUser: async function (parent, args) {
    const { followerId, followingId } = args;
    if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
      return new Error("User does not exist (Invalid ID)!");
    }

    const follower = await User.findById(followerId);
    const following = await User.findById(followingId);
    if (!follower || !following) return new Error("User does not exist!");

    const test = follower.following.filter(item => item._id === followingId);
    try {
      const [ updatedFollower, updatedFollowing ] = await Promise.all([
        User.findByIdAndUpdate(followerId, { following: follower.following.includes(String(followingId)) ? follower.following.filter(follower => follower._id === followingId) : [...follower.following, followingId] }),
        User.findByIdAndUpdate(followingId, { followers: following.followers.includes(String(followerId)) ? following.followers.filter(following => following._id === followerId) : [...following.followers, followerId] }) ]);

      return updatedFollower && updatedFollowing ? true : false;
    } catch (error) {
      return new Error(error.message);
    }
  },
  deleteUser: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("User does not exist (Invalid ID)!");
    }

    const user = await User.findById(_id);
    if (!user) return new Error("User does not exist!");

    try {
      const [ deletedUser ] = await Promise.all([User.findByIdAndRemove(_id), Comment.deleteMany({ userId: _id }), Topic.deleteMany({ userId: _id })]);
      
      return deletedUser ? true : false;
    } catch (error) {
      return new Error(error.message);
    }
  },
  deleteAllUsers: async function (parent, args) {
    try {
      const [ deletedUsers ] = await Promise.all([User.deleteMany({}), Comment.deleteMany({}), Topic.deleteMany({})]);

      return deletedUsers.acknowledged;
    } catch (error) {
      return new Error(error.message);
    }
  },

  createForum: async function (parent, args, ctx) {
    const { title, description } = args;
    let index;

    const [ lastForum, exists ] = await Promise.all([ Forum.find({}).sort({ index: -1 }).limit(1).select("index"), Forum.findOne({ title }) ]);
    index = lastForum[0] ? lastForum[0].index + 1 : 1;
    if (exists) return new Error("Forum title already taken!");

    const slug = createSlug(index, formatStringAndKeepCase(title).toLowerCase());
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
      return new Error(error.message);
    }
  },
  updateForum: async function (parent, args) {
    const { _id, title, description } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Forum does not exist (Invalid ID)!");
    }

    const forum = await Forum.findById(_id);
    if (!forum) return new Error("Forum does not exist!");

    const slug = createSlug(forum.index, formatStringAndKeepCase(title).toLowerCase());
    const path = `/forum/${slug}`;

    try {
      const updatedForum = await Forum.findByIdAndUpdate(
        _id,
        {
          title,
          description,
          slug,
          path
        },
        { new: true }
      );

      return updatedForum;
    } catch (error) {
      if (error.message.includes("E11000"))
        return new Error("Forum title already taken!");
      return new Error(error.message);
    }
  },
  toggleHideForum: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Forum does not exist (Invalid ID)!");
    }

    const forum = await Forum.findById(_id);
    if (!forum) return new Error("Forum does not exist!");

    try {
      const updatedForum = await Forum.findByIdAndUpdate(
        _id,
        {
          hidden: !forum.hidden
        },
        { new: true }
      );

      return updatedForum ? true : false;
    } catch (error) {
      return new Error(error.message);
    }
  },
  deleteForum: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Forum does not exist (Invalid ID)!");
    }

    const forum = await Forum.findById(_id);
    if (!forum) return new Error("Forum does not exist!");

    try {
      const [ deletedForum ] = await Promise.all([Forum.findByIdAndRemove(_id), Comment.deleteMany({}), Topic.deleteMany({})]);

      return deletedForum ? true : false;
    } catch (error) {
      return new Error(error.message);
    }
  },
  deleteAllForums: async function (parent, args) {
    try {
      const [ deletedForums ] = await Promise.all([Forum.deleteMany({}), Comment.deleteMany({}), Topic.deleteMany({})]);

      return deletedForums.acknowledged;
    } catch (error) {
      return new Error(error.message);
    }
  },

  createTopic: async function (parent, args) {
    const { title, forumId, userId } = args;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return new Error("User does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(forumId))
      return new Error("Forum does not exist (Invalid ID)!");

    const [ user, forum ] = await Promise.all([ User.findById(userId), Forum.findById(forumId) ]);
    if (!user) return new Error("User does not exist!");
    if (!forum) return new Error("Forum does not exist!");

    let index;

    const lastTopic = await Topic.find({}).sort({ index: -1 }).limit(1).select("index");
    index = lastTopic[0] ? lastTopic[0].index + 1 : 1;

    const slug = createSlug(index, formatStringAndKeepCase(title).toLowerCase());
    const path = `/topic/${slug}`;

    try {
      const topic = await Topic.create({
        index,
        title,
        forumId,
        userId,
        slug,
        path
      });

      return topic;
    } catch (error) {
      return new Error(error.message);
    }
  },
  updateTopic: async function (parent, args) {
    const { title, _id, forumId } = args;
    if (!mongoose.Types.ObjectId.isValid(_id))
      return new Error("Topic does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(forumId))
      return new Error("Forum does not exist (Invalid ID)!");

    const [ topic, forum ] = await Promise.all([ Topic.findById(_id), Forum.findById(forumId) ]);
    if (!topic) return new Error("Topic does not exist!");
    if (!forum) return new Error("Forum does not exist!");

    const slug = createSlug(topic.index, formatStringAndKeepCase(title).toLowerCase());
    const path = `/topic/${slug}`;

    try {
      const updatedTopic = await Topic.findByIdAndUpdate(
        _id,
        {
          title,
          slug,
          path
        },
        { new: true }
      );

      return updatedTopic;
    } catch (error) {
      return new Error(error.message);
    }
  },
  updateTopicForum: async function(parent, args) {
    const { _id, forumId, newForumId } = args;
    if (!mongoose.Types.ObjectId.isValid(_id))
      return new Error("Topic does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(forumId))
      return new Error("Forum does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(newForumId))
      return new Error("New forum does not exist (Invalid ID)!");

    const [ topic, forum, forums ] = await Promise.all([ Topic.findById(_id), Forum.findById(forumId), Forum.find({}) ])
    if (!topic) return new Error("Topic does not exist!");
    if (!forum) return new Error("Forum does not exist!");
    if (forums.find(forum => String(forum._id) === newForumId) === -1) return new Error("New forum does not exist!");

    try {
      const updatedTopic = await Topic.findByIdAndUpdate(
        _id,
        {
          forumId: newForumId
        },
        { new: true }
      );

      return updatedTopic;
    } catch (error) {
      return new Error(error.message);
    }
  },
  toggleHideTopic: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Topic does not exist (Invalid ID)!");
    }

    const topic = await Topic.findById(_id);
    if (!topic) return new Error("Topic does not exist!");

    try {
      const updatedTopic = await Topic.findByIdAndUpdate(
        _id,
        {
          hidden: !topic.hidden
        },
        { new: true }
      );

      return updatedTopic ? true : false;
    } catch (error) {
      return new Error(error.message);
    }
  },
  deleteTopic: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Topic does not exist (Invalid ID)!");
    }

    const topic = await Topic.findById(_id);
    if (!topic) return new Error("Topic does not exist!");

    try {
      const [ deletedTopic ] = await Promise.all([Topic.findByIdAndRemove(_id), Comment.deleteMany({ topicId: _id }) ]);

      return deletedTopic ? true : false;
    } catch (error) {
      return new Error(error.message);
    }
  },
  deleteAllTopics: async function (parent, args) {
    try {
      const [ deletedTopics ] = await Promise.all([ Topic.deleteMany({}), Comment.deleteMany({}) ]);

      return deletedTopics.acknowledged;
    } catch (error) {
      return new Error(error.message);
    }
  },

  createComment: async function (parent, args) {
    const { content, topicId, userId } = args;
    if (!mongoose.Types.ObjectId.isValid(topicId))
      return new Error("Topic does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(userId))
      return new Error("User does not exist (Invalid ID)!");

    const [ lastComment, topic, user ] = await Promise.all([ Comment.find({}).sort({ index: -1 }).limit(1).select("index"), Topic.findById(topicId), User.findById(userId) ])
    if (!topic) return new Error("Topic does not exist!");
    if (!user) return new Error("User does not exist!");

    try {
      const comment = await Comment.create({
        index: lastComment[0] ? lastComment[0].index + 1 : 1,
        content,
        topicId,
        userId,
      });

      return comment;
    } catch (error) {
      return new Error(error.message);
    }
  },
  updateComment: async function (parent, args) {
    let { content } = args;
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id))
      return new Error("Comment does not exist (Invalid ID)!");

    const comment = await Comment.findById(_id)
    if (!comment) return new Error("Comment does not exist!");

    try {
      const updatedComment = await Comment.findByIdAndUpdate(
        _id,
        {
          content
        },
        { new: true }
      );

      return updatedComment;
    } catch (error) {
      return new Error(error.message);
    }
  },
  toggleHideComment: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Comment does not exist (Invalid ID)!");
    }

    const comment = await Comment.findById(_id);
    if (!comment) return new Error("Comment does not exist!");

    try {
      const updatedComment = await Comment.findByIdAndUpdate(
        _id,
        {
          hidden: !comment.hidden
        },
        { new: true }
      );

      return updatedComment ? true : false;
    } catch (error) {
      return new Error(error.message);
    }
  },
  deleteComment: async function (parent, args) {
    const { _id } = args;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return new Error("Comment does not exist (Invalid ID)!");
    }

    const comment = await Comment.findById(_id);
    if (!comment) return new Error("Comment does not exist!");

    try {
      return await Comment.findByIdAndRemove(_id) ? true : false;
    } catch (error) {
      return new Error(error.message);
    }
  },
  deleteAllComments: async function (parent, args) {
    try {
      const [ deletedComments ] = await Promise.all([ Comment.deleteMany({}), Topic.deleteMany({}) ]);

      return deletedComments.acknowledged;
    } catch (error) {
      return new Error(error.message);
    }
  },

  createTopicWithComment: async function (parent, args) {
    let { title, content, forumId, userId } = args;
    if (!mongoose.Types.ObjectId.isValid(forumId))
      return new Error("Forum does not exist (Invalid ID)!");
    if (!mongoose.Types.ObjectId.isValid(userId))
      return new Error("User does not exist (Invalid ID)!");

    const [ forum, user, lastTopic, lastComment ] = await Promise.all([ Forum.findById(forumId), User.findById(userId), Topic.find({}).sort({ index: -1 }).limit(1).select("index"), Comment.find({}).sort({ index: -1 }).limit(1).select("index") ])
    if (!forum) return new Error("Forum does not exist!");
    if (!user) return new Error("User does not exist!");

    const topicIndex = lastTopic[0] ? lastTopic[0].index + 1 : 1;
    const commentIndex = lastComment[0] ? lastComment[0].index + 1 : 1;

    const slug = createSlug(topicIndex, formatStringAndKeepCase(title).toLowerCase());
    const path = `/topic/${slug}`;

    try {
      const topic = await Topic.create({
        index: topicIndex,
        title,
        forumId,
        userId,
        slug,
        path,
      });
      const comment = await Comment.create({
        index: commentIndex,
        content,
        forumId,
        topicId: String(topic._id),
        userId,
      });

      return topic;
    } catch (error) {
      return new Error(error.message);
    }
  },

  login: async function (parent, args, ctx) {
    const { displayName, email, password } = args;

    // let username = formatStringAndLowerCase(displayName);
    const user = await User.findOne({
      $or: [{ displayName }, { username: formatStringAndKeepCase(displayName).toLowerCase() }, { email }],
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
      return new Error(error.message);
    }
  },

  signup: async function (parent, args, ctx) {
    let { displayName, email, password } = args;

    let index, username;

    const lastUser = await User.find({}).sort({ index: -1 }).limit(1).select("index");
    index = lastUser[0] ? lastUser[0].index + 1 : 1;

    displayName = formatStringAndKeepCase(displayName);

    username = displayName.toLowerCase();
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return new Error("Username and/or email already in use!");

    const slug = createSlug(index, username);
    const path = `/profile/${slug}`;

    if (!isEmail(email)) return new Error("Email is not valid!");
    if (!isStrongPassword(password))
      return new Error("Password is not strong enough!");
    password = await bcryptjs.hash(password, 12);

    const roles = ["Member"];
    const permissions = ["read:own_user", "write:own_user"];

    try {
      const user = await User.create({
        index,
        displayName,
        username,
        email,
        password,
        slug,
        path,
        roles,
        permissions
      });

      ctx.res.cookie("authorization", createToken(user._id), { maxAge: 60*60*24*1000 });

      return user;
    } catch (error) {
      return new Error(error.message);
    }
  },
};
