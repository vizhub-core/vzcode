const mongoosee = require('mongoose');

const TaskSchema = new mongoosee.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    collaborators: { type: [String], default: [] }
});

const Task = mongoosee.model('Task', TaskSchema);

export default Task;
