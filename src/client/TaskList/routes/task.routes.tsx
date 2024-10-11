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

router.patch('/tasks/:id/complete', async (req, res) => {
    //IMPLEMENT SOOn
});
module.exports = router;