const mongoose = require("mongoose");

// One document = one student. Each student belongs to one college.
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required."],
      trim: true,
      maxlength: [100, "Student name cannot be more than 100 characters."],
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required."],
      trim: true,
      maxlength: [40, "Roll number cannot be more than 40 characters."],
    },
    enrollmentNumber: { type: String, trim: true, maxlength: 40 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email address is not valid."],
    },
    mobile: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits."],
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: [true, "College is required."],
    },
    course: { type: String, trim: true, maxlength: 80 },
    branch: { type: String, trim: true, maxlength: 80 },
    semester: {
      type: String,
      trim: true,
      match: [/^([1-9]|1[0-2])$/, "Semester must be a number from 1 to 12."],
    },
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female or Other.",
      },
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value.getTime() <= Date.now();
        },
        message: "Date of birth cannot be in the future.",
      },
    },
    address: { type: String, trim: true, maxlength: 300 },
    city: { type: String, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80 },
    pinCode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, "PIN code must be exactly 6 digits."],
    },
    admissionDate: { type: Date },
    status: {
      type: String,
      enum: {
        values: ["Active", "Inactive"],
        message: "Status must be Active or Inactive.",
      },
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// A roll number can be used only once inside the same college
// (case-insensitive, so "cs01" and "CS01" count as the same).
studentSchema.index(
  { college: 1, rollNumber: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("Student", studentSchema);
