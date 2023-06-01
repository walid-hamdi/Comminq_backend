import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import config from "./startups/config.js";
import db from "./startups/db.js";
import routes from "./startups/routes.js";
import storage from "./startups/storage.js";

const app = express();

dotenv.config();

// Configuration
config();

app.use(express.json());
// app.use(cors({ origin: process.env.FRONTEND_HOST, credentials: true }));
app.use(cors());

// Database setup
db(app);

// Storage setup
storage();

// Routes setup
routes(app);

// Server setup
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
