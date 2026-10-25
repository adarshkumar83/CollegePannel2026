
require("dotenv").config();

const mongoose = require("mongoose");

async function connectDB() {
    try {
        const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/admin_college";

        await mongoose.connect(MONGO_URI);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;
