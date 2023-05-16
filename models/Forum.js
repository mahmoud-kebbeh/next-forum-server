import mongoose from "mongoose";

const forumSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    
    description: String,
    
    hidden: {
    type: Boolean,
    default: false,
    },
    
    slug: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Forum = mongoose.models.Forum || mongoose.model("Forum", forumSchema);

export default Forum;
