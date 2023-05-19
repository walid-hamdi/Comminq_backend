import express from "express";

import config from "./startups/config.js";
import db from "./startups/db.js";
import routes from "./startups/routes.js";

const app = express();
config(app, express);
db(app);
routes(app, express);
