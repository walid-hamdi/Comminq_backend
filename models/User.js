import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    googleLogin: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      url: { type: String },
      public_id: { type: String },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiry: Date,

    verificationCode: String,
    verificationCodeExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
