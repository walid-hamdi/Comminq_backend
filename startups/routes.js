import userRouter from "../routes/user.js";

export default function routes(app) {
  app.get("/", (req, res) => {
    res.json({ msg: "Default endpoint result." });
  });
  app.use("/api/user", userRouter);
}
