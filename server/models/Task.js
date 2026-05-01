const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    tags: [{ type: String }],
    dueDate: { type: Date },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    submissions: [
      {
        fileName: String,
        fileUrl: String,
        submittedAt: { type: Date, default: Date.now },
        submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
