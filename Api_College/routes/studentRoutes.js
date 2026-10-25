const express = require("express");
const studentController = require("../controllers/studentController");
const router = express.Router();


router.get("/", function (req, res) {
  studentController.getStudents(req, res);
});

// Must stay above "/:id", otherwise "options" is read as an ID
router.get("/options", function (req, res) {
  studentController.getStudentOptions(req, res);
});

router.get("/:id", function (req, res) {
  studentController.getStudent(req, res);
});

router.post("/", function (req, res) {
  studentController.createStudent(req, res);
});

router.put("/:id", function (req, res) {
  studentController.updateStudent(req, res);
});

router.delete("/:id", function (req, res) {
  studentController.deleteStudent(req, res);
});

module.exports = router;
