import mongoose from 'mongoose';

const mongoUrl = "mongodb+srv://vaibhavshelke218:aVQ0mwMfgAxckLNh@taskmanager.m8tbx.mongodb.net/?retryWrites=true&w=majority&appName=taskManager";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Database is connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

export default connectToMongo;
