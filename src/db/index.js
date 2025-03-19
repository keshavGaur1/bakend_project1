import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

 const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(`\n Connected to MongoDB !! DB HOST : ${connectionInstance.connection.host}`);
    // ye batata hai ki database khai dusre host per to nhi connected hai

  } catch (error) {
    console.error("ERROR", error);
    process.exit(1);
  }
};

export default connectDB;