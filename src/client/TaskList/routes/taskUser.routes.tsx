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