export default function routes(app, express) {
  app.get("/", (req, res) => {
    res.json({ msg: "Default endpoint result." });
  });
}
