const mongoose = require("mongoose");
const College = require("../models/College");
const Student = require("../models/Student");

// Fields the client is allowed to send
const FIELDS = [
  "name",
  "code",
  "address",
  "addressLine1",
  "addressLine2",
  "state",
  "city",
  "pinCode",
  "contactPerson",
  "contactNumber",
  "email",
  "website",
  "status",
];

const DUPLICATE_CODE_MESSAGE = "A college with this code already exists.";

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
    return res.status(409).json({ message: DUPLICATE_CODE_MESSAGE });
  }

  res.status(500).json({ message: error.message });
}

// Find college by ID
async function findCollegeOr404(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "College not found." });
    return null;
  }

  const college = await College.findById(req.params.id);

  if (!college) {
    res.status(404).json({ message: "College not found." });
    return null;
  }

  return college;
}

// Check that no other college already uses this code
async function codeIsTaken(code, ignoreId) {
  if (!code || typeof code !== "string") return false;

  const query = { code: code.toUpperCase() };

  if (ignoreId) {
    query._id = { $ne: ignoreId };
  }

  const found = await College.findOne(query).select("_id");

  return Boolean(found);
}

// Get all colleges (optional ?search= and ?status=)
async function getColleges(req, res) {
  try {
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim();
    const filter = {};

    if (search) {
      const pattern = { $regex: escapeRegex(search), $options: "i" };

      filter.$or = [
        { name: pattern },
        { code: pattern },
        { city: pattern },
        { state: pattern },
        { contactPerson: pattern },
      ];
    }

    if (status) {
      if (status !== "Active" && status !== "Inactive") {
        return res
          .status(400)
          .json({ message: "Status must be Active or Inactive." });
      }

      filter.status = status;
    }

    const colleges = await College.find(filter).sort({ createdAt: 1 });

    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get college by ID
async function getCollege(req, res) {
  try {
    const college = await findCollegeOr404(req, res);

    if (!college) return;

    res.json(college);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add new college
async function createCollege(req, res) {
  try {
    const data = cleanBody(req.body);

    if (await codeIsTaken(data.code)) {
      return res.status(409).json({ message: DUPLICATE_CODE_MESSAGE });
    }

    const college = new College(data);

    await college.save();

    res.status(201).json(college);
  } catch (error) {
    sendError(res, error);
  }
}

// Update college
async function updateCollege(req, res) {
  try {
    const college = await findCollegeOr404(req, res);

    if (!college) return;

    const data = cleanBody(req.body);

    // Status is never cleared. Keep the current one if none is sent
    if (data.status === undefined) {
      data.status = college.status;
    }

    if (await codeIsTaken(data.code, college._id)) {
      return res.status(409).json({ message: DUPLICATE_CODE_MESSAGE });
    }

    FIELDS.forEach(function (field) {
      college.set(field, data[field]);
    });

    await college.save();

    res.json(college);
  } catch (error) {
    sendError(res, error);
  }
}

// Delete college (blocked while students belong to it)
async function deleteCollege(req, res) {
  try {
    const college = await findCollegeOr404(req, res);

    if (!college) return;

    const studentCount = await Student.countDocuments({ college: college._id });

    if (studentCount > 0) {
      return res.status(409).json({
        message:
          "This college cannot be deleted because " +
          studentCount +
          (studentCount === 1 ? " student is" : " students are") +
          " linked to it. Move or delete those students first.",
      });
    }

    await college.deleteOne();

    res.json({ message: "College deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getColleges,
  getCollege,
  createCollege,
  updateCollege,
  deleteCollege,
};
