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
    //Basically what we want to do is 
    //get the body data from a form that we will create
    //and create a task from it, then add it to an existing tasklist

    //Get the one and only existing tasklist
    const taskList = await TaskList.find();

    //TODO: create a task and figure out how to append it to thsi taask
  } catch (error) {
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
