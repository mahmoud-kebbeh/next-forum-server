import Topic from "./../../models/Topic.js";
import Comment from "./../../models/Comment.js";

export const Forum = {
	topicsCount: async function (parent, args) {
		const { _id } = parent;
		
		return await Topic.countDocuments({ forumId: _id });
	},

	commentsCount: async function (parent, args) {
		const { _id } = parent;

		const topics = await Topic.find({ forumId: _id });

		const commentsCounts = await Promise.all(topics.map(async (topic) => await Comment.countDocuments({ topicId: topic._id})));

		return commentsCounts.reduce((total, count) => total + count, 0);
	},

	topics: async function (parent, args) {
		const { _id } = parent;
		const { topicsLimit, hidden, sort } = args;
		
		const topics = await Topic.find({ forumId: _id, hidden: hidden === true ? true : hidden === false ? false : { $exists: true } }).sort({ createdAt: sort === "ASC" ? 1 : sort === "DESC" ? -1 : 1 }).limit(`${topicsLimit ? topicsLimit : 0}`)
		// .sort({ createdAt: -1 })
			;

		return topics;
	},

	comments: async function (parent, args) {
		const { _id } = parent;
		const { commentsLimit, hidden, sort } = args;
		
		const topics = await Topic.find({ forumId: _id, hidden: hidden === true ? true : hidden === false ? false : { $exists: true } }).sort({ createdAt: sort === "ASC" ? 1 : sort === "DESC" ? -1 : 1 });
		topicsIds = topics.map(topic => String(topic._id));
			
		const comments = await topicsIds.map(async (_id) => {
			const topicComments = await Comment.find({ topicId: _id, hidden: hidden === true ? true : hidden === false ? false : { $exists: true } })
				.sort({ createdAt: sort === "ASC" ? 1 : sort === "DESC" ? -1 : 1 })
				.limit(`${commentsLimit ? commentsLimit : 0}`)
				;

				return topicComments;
		});

		return comments;
	},
};
