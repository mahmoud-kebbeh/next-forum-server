import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    
    slug: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    
    phoneNumber: String,
    picture: String,
    rank: String,
    signature: String,

    hidden: {
    type: Boolean,
    default: false,
    },
    banned: {
    type: Boolean,
    default: false,
    },
    restricted: {
    type: Boolean,
    default: false,
    },

    roles: [String],
    permissions: [String],

    followers: [mongoose.Types.ObjectId],
    following: [mongoose.Types.ObjectId],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
