import mongoose from "mongoose";
import { db_url, prod_db_url } from "../config/mongodbConfig.js";

mongoose.set("strictQuery", true);

export const connectDB = () => {
  mongoose
    .connect(db_url, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      retryWrites: true,
      w: "majority",
    })
    .then((res) => console.log("Database connected!"))
    .catch((error) => console.log("Error while connecting DB: ", error));
};
