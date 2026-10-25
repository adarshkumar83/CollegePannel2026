const express = require("express");
const examController = require("../controllers/examController");
const router = express.Router();


router.get("/", function (req, res) {
  examController.getExams(req, res);
});

router.get("/:id", function (req, res) {
  examController.getExam(req, res);
});

router.post("/", function (req, res) {
  examController.createExam(req, res);
});

router.put("/:id", function (req, res) {
  examController.updateExam(req, res);
});

router.delete("/:id", function (req, res) {
  examController.deleteExam(req, res);
});

module.exports = router;
