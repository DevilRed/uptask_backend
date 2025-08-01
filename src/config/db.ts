import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL!);
    const url = `${connection.connection.host}:${connection.connection.port}`;
    console.log(`MongoDB connected to ${url}`);
  } catch (error) {
    console.log(`MongoDB connection error`);
    console.log(error);
    process.exit(1);
  }
};
