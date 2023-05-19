import mongoose from "mongoose";

export default async function db(app) {
  const PORT = process.env.PORT;
  const MONGO_URI = process.env.MONGO_URI;
  const NODE_ENV = process.env.NODE_ENV;
  try {
    await mongoose.connect(MONGO_URI);
    app.listen(PORT, () =>
      console.log(`Connected with ${NODE_ENV} mode. PORT: ${PORT}`)
    );
  } catch (error) {
    console.log(error.message);
  }
}
