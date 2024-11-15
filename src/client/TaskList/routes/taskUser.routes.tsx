const express = require('express');
const mongoose = require('mongoose');
const TaskUser = require('./models/TaskUser');
const Task = require('./models/Task');
const router = express.Router();

//Create a New TaskUser
router.post('/api/task-users', async (req, res) => {
    try {
        const taskUser = new TaskUser(req.body);
        await taskUser.save();
        res.status(201).json(taskUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//Get All TaskUsers
router.get('/api/task-users', async (req, res) => {
    try {
        const taskUsers = await TaskUser.find();
        res.json(taskUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Get a Single TaskUser by ID
router.get('/api/task-users/:id', async (req, res) => {
    try {
        const taskUser = await TaskUser.findById(req.params.id);
        if (!taskUser) {
            return res.status(404).json({ error: 'TaskUser not found' });
        }
        res.json(taskUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Update a TaskUser
router.put('/api/task-users/:id', async (req, res) => {
    try {
        const taskUser = await TaskUser.findByIdAndUpdate(
            req.params.id,
            req.body,
            { 
                new: true, 
                runValidators: true 
            }
        );
        if (!taskUser) {
            return res.status(404).json({ 
                error: 'TaskUser not found' 
            });
        }
        res.json(taskUser);
    } catch (error) {
        res.status(400).json({ 
            error: error.message 
        });
    }
});

//Delete a TaskUser
router.delete('/api/task-users/:id', async (req, res) => {
    try {
        const taskUser = await TaskUser.findByIdAndDelete(req.params.id);
        if (!taskUser) {
            return res.status(404).json({ error: 'TaskUser not found' });
        }
        res.json({ message: 'TaskUser deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Get All TaskUsers by Status
router.get('/api/task-users/status/:status', async (req, res) => {
    try {
        const taskUsers = await TaskUser.find({ status: req.params.status });
        res.json(taskUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Get All TaskUsers Assigned to a Specific Task
router.get('/api/tasks/:taskId/task-users', async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId).populate('collaborators');
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task.collaborators);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Add a TaskUser to a Task
router.post('/api/tasks/:taskId/task-users/:userId', async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        const taskUser = await TaskUser.findById(req.params.userId);
        if (!taskUser) {
            return res.status(404).json({ error: 'TaskUser not found' });
        }
        if (!task.collaborators.includes(taskUser._id)) {
            task.collaborators.push(taskUser._id);
            await task.save();
        }
        res.json(task);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Remove a TaskUser from a Task
router.delete('/api/tasks/:taskId/task-users/:userId', async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        task.collaborators = task.collaborators.filter(
            (collaboratorId) => collaboratorId.toString() !== req.params.userId
        );
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;