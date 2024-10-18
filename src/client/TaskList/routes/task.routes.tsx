const express = require('express');
const task = require('./models/task.schema.tsx');  
const router = express.Router();

//Create a Task
router.post('/tasks', async (req, res) => {
    try 
    {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json({ message: 'Task created successfully', task });
    } 
    catch (err) 
    {
        res.status(400).json({ error: err.message });
    }
});

// Get all Tasks
router.get('/tasks', async (req, res) => {
    try {
        const { completed, priority } = req.query;
        const query = {};
        if (completed) query["completed"] = completed === 'true';
        if (priority) query["priority"] = priority;
        const tasks = await Task.find(query);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single Task by ID
router.get('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a Task by ID
router.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task updated successfully', task });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//Mark a task as completed
router.patch('/tasks/:id/complete', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        task.completed = true;
        await task.save();
        res.json({ message: 'Task marked as completed', task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a Task
router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;