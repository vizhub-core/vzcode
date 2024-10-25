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