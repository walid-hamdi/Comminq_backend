import userRouter from "../routes/user.js";
import swagger from "./swagger.js";

export default function routes(app) {
  app.get("/", (req, res) => {
    res.json({ msg: "Default endpoint result." });
  });
  app.use("/api-docs", swagger.serve, swagger.specsSetup);
  app.use("/api/user", userRouter);
}
