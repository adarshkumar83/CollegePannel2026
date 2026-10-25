
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./connection");
const examRoutes = require("./routes/examRoutes");
const collegeRoutes = require("./routes/collegeRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Check server status
app.get("/api/health", function (req, res) {
    res.json({ status: "ok" });
});

// Exam routes
app.use("/api/exams", examRoutes);

// College routes
app.use("/api/colleges", collegeRoutes);

// Student routes
app.use("/api/students", studentRoutes);

// Handle unknown routes
app.use(function (req, res) {
    res.status(404).json({
        message: "Route not found."
    });
});

// Handle errors
app.use(function (err, req, res, next) {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "Request body is not valid JSON."
        });
    }

    console.error(err);

    res.status(500).json({
        message: "Something went wrong on the server."
    });
});

// Connect MongoDB and start server
async function startServer() {
    await connectDB();

    app.listen(PORT, function () {
        console.log("Server is running on http://localhost:" + PORT);
    });
}

startServer();
