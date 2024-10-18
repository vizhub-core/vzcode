const mongoose = require('mongoose');
const TaskUser = require('./taskUser'); // Import the TaskUser model

const TaskSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: 'medium' 
    },
    dueDate: { type: Date }, // Optional due date
    collaborators: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TaskUser' 
    }], // Reference to TaskUser objects
}, 
{ 
    timestamps: true // Automatically creates `createdAt` and `updatedAt`
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;
