const express = require("express");
const multer = require("multer");
const path = require("path");
const Task = require("../models/Task");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Get all tasks (Dashboard stats)
router.get("/", protect, async (req, res) => {
  try {
    let query = {};
    // Members only see their tasks, admins see all
    if (req.user.role === "MEMBER") {
      query.assigneeId = req.user.id;
    }
    const tasks = await Task.find(query).populate("projectId", "name").populate("assigneeId", "name email");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create task (Admin only)
router.post("/", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const { title, description, dueDate, projectId, assigneeId, priority, tags } = req.body;
    const task = await Task.create({
      title,
      description,
      dueDate,
      projectId,
      assigneeId,
      priority,
      tags
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update task status (Assignee or Admin)
router.put("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Ensure member is the assignee
    if (req.user.role === "MEMBER" && task.assigneeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    const { status, title, description, dueDate, assigneeId, priority, tags } = req.body;
    
    // Only Admin can change details other than status
    if (req.user.role === "ADMIN") {
      task.title = title || task.title;
      task.description = description || task.description;
      task.dueDate = dueDate || task.dueDate;
      task.assigneeId = assigneeId || task.assigneeId;
      task.priority = priority || task.priority;
      task.tags = tags || task.tags;
    }
    task.status = status || task.status;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete task (Admin only)
router.delete("/:id", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    await task.deleteOne();
    res.json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Submit a file for a task
router.post("/:id/submit", protect, upload.single("file"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Ensure member is the assignee
    if (req.user.role === "MEMBER" && task.assigneeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to submit to this task" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const submission = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      submittedBy: req.user.id,
    };

    task.submissions.push(submission);
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
