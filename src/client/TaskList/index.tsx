const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    collaborators: {type: [String], default: []},
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: 'medium' 
    }, 
    dueDate: { type: Date }, // Optional due date
}, 
{ 
    timestamps: true // Automatically creates `createdAt` and `updatedAt`
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;
