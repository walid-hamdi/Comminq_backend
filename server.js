import express from "express";

import config from "./startups/config.js";
import db from "./startups/db.js";

const app = express();
app.use(express.json());

config(app);
db(app);
