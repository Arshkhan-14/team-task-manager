const express = require("express");
const Project = require("../models/Project");
const Task = require("../models/Task");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Get all projects (Admins see all, Members see projects they are assigned tasks in... 
// For simplicity, let's allow all authenticated users to view projects)
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find().populate("ownerId", "name email");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single project details with tasks
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("ownerId", "name email");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const tasks = await Task.find({ projectId: req.params.id }).populate("assigneeId", "name email");
    res.json({ project, tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create new project (Admin only)
router.post("/", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      ownerId: req.user.id,
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete project (Admin only)
router.delete("/:id", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    await Task.deleteMany({ projectId: req.params.id });
    await project.deleteOne();
    
    res.json({ message: "Project removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
