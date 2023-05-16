import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    
    hidden: {
    type: Boolean,
    default: false,
    },
    
    topicId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;
