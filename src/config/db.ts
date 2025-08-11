import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const databaseConnection = process.env.NODE_ENV === 'test' ? process.env.DATABASE_TESTING_URL : process.env.DATABASE_URL
    const connection = await mongoose.connect(databaseConnection!);
    const url = `${connection.connection.host}:${connection.connection.port}`;
    console.log(`MongoDB connected to ${url}`);
  } catch (error) {
    console.log(`MongoDB connection error`);
    console.log(error);
    // process.exit(1);
  }
};
export const closeDB = async () => {
  try {
    await mongoose.connection.close()
    console.log('MongoDB connection closed');
  } catch (error) {
    console.log('Error closing MongoDB connection');
    throw error;

  }
}