
const mongoose = require("mongoose");
const Exam = require("../models/Exam");

// Find exam by ID
async function findExamOr404(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Exam not found." });
    return null;
  }

  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    res.status(404).json({ message: "Exam not found." });
    return null;
  }

  return exam;
}

// Get all exams
async function getExams(req, res) {
  try {
    const search = String(req.query.search || "").trim();
    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const exams = await Exam.find(filter).sort({ createdAt: 1 });

    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get exam by ID
async function getExam(req, res) {
  try {
    const exam = await findExamOr404(req, res);

    if (!exam) return;

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add new exam
async function createExam(req, res) {
  try {
    const exam = new Exam(req.body);

    await exam.save();

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update exam
async function updateExam(req, res) {
  try {
    const exam = await findExamOr404(req, res);

    if (!exam) return;

    exam.set(req.body);

    await exam.save();

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete exam
async function deleteExam(req, res) {
  try {
    const exam = await findExamOr404(req, res);

    if (!exam) return;

    await exam.deleteOne();

    res.json({ message: "Exam deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
};
