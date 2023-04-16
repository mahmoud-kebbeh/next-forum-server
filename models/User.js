import mongoose from "mongoose";

export const userSchema = new mongoose.Schema(
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
      // minlength: [3, "The name you entered is too short!"],
      // maxlength: [20, "The name you entered is too long!"],
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
      // minlength: 8,
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
    pictureURL: String,
    rank: String,
    signature: String,
    roles: [String],
    permissions: [String],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
