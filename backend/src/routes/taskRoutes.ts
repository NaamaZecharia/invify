import express from 'express';
import Task from '../models/Task.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all tasks
router.get('/', protect, async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// POST a new task
router.post('/', protect, async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
   try {
    await Task.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  const updated = await Task.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updated);
});

export default router;
