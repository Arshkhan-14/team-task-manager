const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" },
    department: {
      type: String,
      enum: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "UI/UX Designer", "QA Tester"],
      default: "Frontend Developer"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
