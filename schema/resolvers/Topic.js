import Comment from "./../../models/Comment.js";
import Forum from "./../../models/Forum.js";
import User from "./../../models/User.js";

const Topic = {
	forum: async function (parent, args) {
		const { forumId } = parent;

		const forum = await Forum.findById(forumId);

		return forum;
	},

	user: async function (parent, args) {
		const { userId } = parent;

		const user = await User.findById(userId);

		return user;
	},
	
	comments: async function (parent, args) {
		const { _id } = parent;
		const { commentsLimit } = args;

		if (commentsLimit) {
			return await Comment.find({ topicId: _id })
				.sort({ index: -1 })
				.limit(commentsLimit);
		}

		const comments = await Comment.find({ topicId: _id }).sort({ index: 1 });
		// .sort({ createdAt: -1 });

		return comments;
	},

	commentsCount: async function (parent, args) {
		const { _id } = parent;
		return await Comment.countDocuments({ topicId: _id, type: "POST" });
	},
};

export { Topic };
