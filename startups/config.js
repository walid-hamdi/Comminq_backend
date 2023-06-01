import dotenv from "dotenv";

dotenv.config();

export default function config() {
  if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: ".env.production" });
  } else {
    dotenv.config({ path: ".env.development" });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("FATAL ERROR: db is not defined.");
  }
}
