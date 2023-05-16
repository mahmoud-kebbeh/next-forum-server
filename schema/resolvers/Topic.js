import Comment from "./../../models/Comment.js";
import Forum from "./../../models/Forum.js";
import User from "./../../models/User.js";

export const Topic = {
	commentsCount: async function (parent, args) {
		const { _id } = parent;
		
		return await Comment.countDocuments({ topicId: _id });
	},

	forum: async function (parent, args) {
		const { forumId } = parent;

		return await Forum.findById(forumId);
	},

	user: async function (parent, args) {
		const { userId } = parent;

		return await User.findById(userId);
	},
	
	comments: async function (parent, args) {
		const { _id } = parent;
		const { commentsLimit, hidden, sort } = args;

		const comments = await Comment.find({ topicId: _id, hidden: hidden === true ? true : hidden === false ? false : { $exists: true } }).sort({ createdAt: sort === "ASC" ? 1 : sort === "DESC" ? -1 : 1 }).limit(`${commentsLimit ? commentsLimit : 0}`);

		return comments;
	},
};
