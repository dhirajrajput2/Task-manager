import express from 'express';
import Task from '../models/Task.js';  
import fetchuser from '../middleware/fetchuser.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();
let success = false;

// 1. Create a Task (POST request)
router.post(
  '/addtask', 
  fetchuser, 
  [
    // Validation rules
    body('title', 'Title must be at least 3 characters long').isLength({ min: 3 }),
    body('description', 'Description must be at least 10 characters long').isLength({ min: 10 }),
    body('status', 'Status must be either "To Do", "In Progress", or "Completed"').isIn(['To Do', 'In Progress', 'Completed']),
    body('priority', 'Priority must be either "Low", "Medium", or "High"').isIn(['Low', 'Medium', 'High']),
    body('dueDate', 'Due Date is required').isISO8601().toDate() // Validate and convert to Date object
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), success: false });
    }

    try {
      const { title, description, status, priority, dueDate } = req.body;
      const newTask = new Task({
        user: req.user.id,
        title,
        description,
        status,
        priority,
        dueDate
      });

      const savedTask = await newTask.save();
      success = true;
      res.status(201).json({ savedTask, message: "Task saved successfully", success });
    } catch (error) {
      success = false;
      res.status(400).json({ error: error.message, success });
    }
  }
);

// 2. Get all Tasks (GET request)
router.get('/fetchalltask', fetchuser, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    success = true;
    res.status(200).json({ tasks, success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Edit a Task (PUT request)
router.put(
  '/updatetask/:id',
  fetchuser,
  [
    // Validation rules
    body('title', 'Title must be at least 3 characters long').optional().isLength({ min: 3 }),
    body('description', 'Description must be at least 10 characters long').optional().isLength({ min: 10 }),
    body('status', 'Status must be either "To Do", "In Progress", or "Completed"').optional().isIn(['To Do', 'In Progress', 'Completed']),
    body('priority', 'Priority must be either "Low", "Medium", or "High"').optional().isIn(['Low', 'Medium', 'High']),
    body('dueDate', 'Due Date must be a valid date').optional().isISO8601().toDate()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), success: false });
    }

    try {
      const { title, description, status, priority, dueDate } = req.body;
      let task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).send("Task not found");
      }

      // Allow update only if the user owns the task
      if (task.user.toString() !== req.user.id) {
        return res.status(401).send("Not allowed");
      }

      // Update the task
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, status, priority, dueDate },
        { new: true }
      );

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// 4. Delete a Task (DELETE request)
router.delete('/deletetask/:id', fetchuser, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).send("Task not found");
    }

    // Allow delete only if the user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
