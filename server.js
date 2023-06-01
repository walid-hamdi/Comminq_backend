import express from "express";
import cors from "cors";

import config from "./startups/config.js";
import db from "./startups/db.js";
import routes from "./startups/routes.js";
import storage from "./startups/storage.js";

const app = express();
app.use(express.json());
app.use(cors());

config();
db(app);
storage();
routes(app);
