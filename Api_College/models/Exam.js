
const mongoose = require("mongoose");

// One document = one examination.
const examSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    type: { type: String },
    physics: { type: Number, default: 0 },
    chemistry: { type: Number, default: 0 },
    mathematics: { type: Number, default: 0 },
    aptitude: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Exam", examSchema);
