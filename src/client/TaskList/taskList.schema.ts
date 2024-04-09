const mongoose = require('mongoose');
import Task from "./task.schema";

const TaskListSchema = new mongoose.Schema({
    tasks: { type: [Task], default: [] }
});

// Create TaskList model
const TaskList = mongoose.model('TaskList', TaskListSchema);

export default TaskList;
