import Forum from "./../../models/Forum.js";
import Topic from "./../../models/Topic.js";
import User from "./../../models/User.js";

export const Comment = {
  topic: async function (parent, args) {
    const { topicId } = parent;

    return await Topic.findById(topicId);
  },
  
  user: async function (parent, args) {
    const { userId } = parent;

    return await User.findById(userId);
  },
};
