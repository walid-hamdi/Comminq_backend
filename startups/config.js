import dotenv from "dotenv";
import cloudinary from "cloudinary";

dotenv.config();

export default function config(app) {
  // env
  if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: ".env.production" });
  } else {
    dotenv.config({ path: ".env.development" });
  }

  // cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  // make sure that var exists
  if (!process.env.JWT_SECRET) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("FATAL ERROR: db is not defined.");
  }
}
