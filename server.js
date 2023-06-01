import express from "express";
import cors from "cors";

import config from "./startups/config.js";
import cookieParser from "cookie-parser";
import db from "./startups/db.js";
import routes from "./startups/routes.js";
import storage from "./startups/storage.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
config();

app.use(
  cors({
    origin: process.env.FRONTEND_HOST,
    credentials: true,
  })
);

db(app);
storage();
routes(app);
