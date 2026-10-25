const mongoose = require("mongoose");

// One document = one college.
const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "College name is required."],
      trim: true,
      maxlength: [150, "College name cannot be more than 150 characters."],
    },
    // Optional, but must be unique when it is provided
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [30, "College code cannot be more than 30 characters."],
    },
    // Full college address (text area on the form)
    address: { type: String, trim: true, maxlength: 300 },
    addressLine1: { type: String, trim: true, maxlength: 200 },
    addressLine2: { type: String, trim: true, maxlength: 200 },
    state: { type: String, trim: true, maxlength: 80 },
    city: { type: String, trim: true, maxlength: 80 },
    pinCode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, "PIN code must be exactly 6 digits."],
    },
    contactPerson: { type: String, trim: true, maxlength: 100 },
    contactNumber: {
      type: String,
      trim: true,
      match: [
        /^\+?[0-9][0-9\s-]{6,14}$/,
        "Contact number must have 7 to 15 digits.",
      ],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email address is not valid."],
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i,
        "Website address is not valid.",
      ],
    },
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

// Unique only when a code exists, so many colleges can have no code
collegeSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { code: { $type: "string" } } }
);

module.exports = mongoose.model("College", collegeSchema);
