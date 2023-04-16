import Topic from "./../../models/Topic.js";
import Comment from "./../../models/Comment.js";

const User = {
	topics: async function (parent, args) {
		const { _id } = parent;
		const { topicsLimit } = args;
		
		if (topicsLimit) {
			return await Topic.find({ userId: _id })
				.sort({ index: -1 })
				.limit(topicsLimit);
		}

		const topics = await Topic.find({ userId: _id }).sort({ index: -1 });
		// .sort({ createdAt: -1 });

		return topics;
	},

	comments: async function (parent, args) {
		const { _id } = parent;
		const { commentsLimit } = args;
		
		if (commentsLimit) {
			return await Comment.find({ userId: _id })
				.sort({ index: -1 })
				.limit(commentsLimit);
		}

		const comments = await Comment.find({ userId: _id }).sort({ index: -1 });
		// .sort({ createdAt: -1 });

		return comments;
	},

	commentsCount: async function (parent, args) {
		const { _id } = parent;
		return await Comment.countDocuments({ userId: _id, type: "POST" });
	},
};

export { User };
