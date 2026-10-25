const mongoose = require("mongoose");
const Student = require("../models/Student");
const College = require("../models/College");

// Fields the client is allowed to send
const FIELDS = [
  "name",
  "rollNumber",
  "enrollmentNumber",
  "email",
  "mobile",
  "college",
  "course",
  "branch",
  "semester",
  "gender",
  "dateOfBirth",
  "address",
  "city",
  "state",
  "pinCode",
  "admissionDate",
  "status",
];

// Case-insensitive matching, used for roll number checks
const COLLATION = { locale: "en", strength: 2 };

const DUPLICATE_ROLL_MESSAGE =
  "This roll number already exists in the selected college.";

// Keep only known fields. Empty text becomes undefined (field is not stored)
function cleanBody(body) {
  const data = {};

  FIELDS.forEach(function (field) {
    let value = body ? body[field] : undefined;

    if (typeof value === "string") {
      value = value.trim();
    }

    data[field] = value === "" || value === null ? undefined : value;
  });

  return data;
}

// Escape special characters so search text is not treated as a regex
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Send the right status code for a database error
function sendError(res, error) {
  if (error.name === "ValidationError") {
    const first = Object.values(error.errors)[0];
    const message =
      first.name === "CastError"
        ? "Invalid value for " + first.path + "."
        : first.message;

    return res.status(400).json({ message: message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: DUPLICATE_ROLL_MESSAGE });
  }

  res.status(500).json({ message: error.message });
}

// Find student by ID
async function findStudentOr404(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Student not found." });
    return null;
  }

  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404).json({ message: "Student not found." });
    return null;
  }

  return student;
}

// Check the college value. Returns an error message, or "" when it is fine
async function checkCollege(value) {
  if (!value) return "College is required.";

  if (typeof value !== "string" || !mongoose.isValidObjectId(value)) {
    return "Please select a valid college.";
  }

  const exists = await College.exists({ _id: value });

  return exists ? "" : "The selected college does not exist.";
}

// Check that no other student in this college has the same roll number
async function rollNumberIsTaken(data, ignoreId) {
  if (!data.rollNumber || typeof data.rollNumber !== "string") return false;

  const query = { college: data.college, rollNumber: data.rollNumber };

  if (ignoreId) {
    query._id = { $ne: ignoreId };
  }

  const found = await Student.findOne(query).collation(COLLATION).select("_id");

  return Boolean(found);
}

// Load one student again with the college name filled in
function withCollege(id) {
  return Student.findById(id).populate("college", "name code status");
}

// Get all students (optional ?search=, ?college=, ?course=, ?branch=,
// ?semester= and ?status=)
async function getStudents(req, res) {
  try {
    const search = String(req.query.search || "").trim();
    const college = String(req.query.college || "").trim();
    const course = String(req.query.course || "").trim();
    const branch = String(req.query.branch || "").trim();
    const semester = String(req.query.semester || "").trim();
    const status = String(req.query.status || "").trim();
    const filter = {};

    if (search) {
      const pattern = { $regex: escapeRegex(search), $options: "i" };

      filter.$or = [
        { name: pattern },
        { rollNumber: pattern },
        { enrollmentNumber: pattern },
        { email: pattern },
      ];
    }

    if (college) {
      if (!mongoose.isValidObjectId(college)) {
        return res.status(400).json({ message: "College filter is not valid." });
      }

      filter.college = college;
    }

    if (course) filter.course = course;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;

    if (status) {
      if (status !== "Active" && status !== "Inactive") {
        return res
          .status(400)
          .json({ message: "Status must be Active or Inactive." });
      }

      filter.status = status;
    }

    const students = await Student.find(filter)
      .populate("college", "name code status")
      .sort({ createdAt: 1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get the values used by the filter dropdowns
async function getStudentOptions(req, res) {
  try {
    const courses = await Student.distinct("course");
    const branches = await Student.distinct("branch");
    const semesters = await Student.distinct("semester");

    res.json({
      courses: courses.filter(Boolean).sort(),
      branches: branches.filter(Boolean).sort(),
      semesters: semesters.filter(Boolean).sort(function (a, b) {
        return Number(a) - Number(b);
      }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get student by ID
async function getStudent(req, res) {
  try {
    const student = await findStudentOr404(req, res);

    if (!student) return;

    await student.populate("college", "name code status");

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add new student
async function createStudent(req, res) {
  try {
    const data = cleanBody(req.body);

    const collegeError = await checkCollege(data.college);

    if (collegeError) {
      return res.status(400).json({ message: collegeError });
    }

    if (await rollNumberIsTaken(data)) {
      return res.status(409).json({ message: DUPLICATE_ROLL_MESSAGE });
    }

    const student = new Student(data);

    await student.save();

    res.status(201).json(await withCollege(student._id));
  } catch (error) {
    sendError(res, error);
  }
}

// Update student
async function updateStudent(req, res) {
  try {
    const student = await findStudentOr404(req, res);

    if (!student) return;

    const data = cleanBody(req.body);

    // Status is never cleared. Keep the current one if none is sent
    if (data.status === undefined) {
      data.status = student.status;
    }

    const collegeError = await checkCollege(data.college);

    if (collegeError) {
      return res.status(400).json({ message: collegeError });
    }

    if (await rollNumberIsTaken(data, student._id)) {
      return res.status(409).json({ message: DUPLICATE_ROLL_MESSAGE });
    }

    FIELDS.forEach(function (field) {
      student.set(field, data[field]);
    });

    await student.save();

    res.json(await withCollege(student._id));
  } catch (error) {
    sendError(res, error);
  }
}

// Delete student
async function deleteStudent(req, res) {
  try {
    const student = await findStudentOr404(req, res);

    if (!student) return;

    await student.deleteOne();

    res.json({ message: "Student deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getStudents,
  getStudentOptions,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
