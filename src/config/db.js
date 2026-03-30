import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Atlas conectada");
  } catch (error) {
    console.error("❌ Error al conectar DB:", error.message);
    process.exit(1);
  }
}

export default connectDB;
