import Topic from "./../../models/Topic.js";
import Comment from "./../../models/Comment.js";
import UserModel from "./../../models/User.js";

export const User = {
	topicsCount: async function (parent, args) {
		const { _id } = parent;

		return await Topic.countDocuments({ userId: _id });
	},

	commentsCount: async function (parent, args) {
		const { _id } = parent;
		
		return await Comment.countDocuments({ userId: _id });
	},
	
	topics: async function (parent, args) {
		const { _id } = parent;
		const { topicsLimit, hidden, sort } = args;

    const topics = await Topic.find({ userId: _id, hidden: hidden === true ? true : hidden === false ? false : { $exists: true } }).sort({ createdAt: sort === "ASC" ? 1 : sort === "DESC" ? -1 : 1 }).limit(`${topicsLimit ? topicsLimit : 0}`)
		// .sort({ createdAt: -1 })
			;

		return topics;
	},

	comments: async function (parent, args) {
		const { _id } = parent;
		const { commentsLimit, hidden, sort } = args;
		
		const comments = await Comment.find({ userId: _id, hidden: hidden === true ? true : hidden === false ? false : { $exists: true } }).sort({ createdAt: sort === "ASC" ? 1 : sort === "DESC" ? -1 : 1 }).limit(`${commentsLimit ? commentsLimit : 0}`)
		// .sort({ createdAt: -1 })
			;
		
		return comments;
	},

	followers: async function (parent, args) {
		const { _id } = parent;
		
		const followers = await UserModel.find({ following: _id })
		// .sort({ createdAt: -1 })
			;
		
		return followers;
	},

	following: async function (parent, args) {
		const { _id } = parent;
		
		const following = await UserModel.find({ followers: _id })
		// .sort({ createdAt: -1 })
			;
		
		return following;
	},
};
