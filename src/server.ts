import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app";
mongoose
  .connect(process.env.MONGO_URI as string, {})
  .then((data) => {
    console.log("MongoDB connected successfully");
    const PORT = process.env.PORT ?? 3003;
    app.listen(PORT, function () {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("ERROR on connection MONGODB", err));
