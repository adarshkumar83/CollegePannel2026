const express = require("express");
const collegeController = require("../controllers/collegeController");
const router = express.Router();


router.get("/", function (req, res) {
  collegeController.getColleges(req, res);
});

router.get("/:id", function (req, res) {
  collegeController.getCollege(req, res);
});

router.post("/", function (req, res) {
  collegeController.createCollege(req, res);
});

router.put("/:id", function (req, res) {
  collegeController.updateCollege(req, res);
});

router.delete("/:id", function (req, res) {
  collegeController.deleteCollege(req, res);
});

module.exports = router;
