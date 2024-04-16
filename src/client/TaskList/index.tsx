import express from 'express';
import mongoose from 'mongoose';
import { assert } from 'vitest';
import TaskList from './taskList.schema';  

const app = express();
const PORT = 3000; 

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/EXAMPLE', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

//Create a new tasklist
app.post('/tasklists', async (req, res) => {
  try {
    // Parse data from request body to create a new task
    const { id, name, description, completed, collaborators } = req.body.taskData;
    const newTask = { id, name, description, completed, collaborators };

    // Get the one and only existing tasklist
    let taskList = await TaskList.findOne();

    if (!taskList) {
      // If no task list exists, create a new one
      taskList = new TaskList({ tasks: [] });
    }

    // Add the new task to the task list
    taskList.tasks.push(newTask);

    // Save the updated task list back to the database
    await taskList.save();

    res.status(201).send(taskList);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get the only existing tasklist
app.get('/tasklist', async (req, res) => {
  try {
    const taskList = await TaskList.find();
    assert(taskList != null && typeof(taskList) != undefined);
    res.send(taskList);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
