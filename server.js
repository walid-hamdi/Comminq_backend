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

// Define the allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://comminq-frontend.vercel.app",
];

// Configure CORS middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Add a middleware to set the Access-Control-Allow-Origin header
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:50951",
    // Add other allowed origins here
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  
  next();
});

db(app);
storage();
routes(app);
