import User from "./../../models/User.js";
import Forum from "./../../models/Forum.js";
import Topic from "./../../models/Topic.js";

const Comment = {
    user: async function (parent, args) {
    const { userId } = parent;

    const user = await User.findById(userId)

    return user;
    },

    forum: async function (parent, args) {
    const { forumId } = parent;

    const forum = await Forum.findById(forumId)

    return forum;
    },

    topic: async function (parent, args) {
    const { topicId } = parent;

    const topic = await Topic.findById(topicId)

    return topic;
    },
};

export { Comment };
