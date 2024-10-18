const mongoose = require('mongoose');

const TaskUserSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    role: { 
        type: String, 
        enum: ['owner', 'collaborator', 'viewer'], 
        default: 'collaborator' 
    },  
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'pending'], 
        default: 'active' 
    }, // User's status in relation to the task
    joinedAt: { type: Date, default: Date.now },  
    lastActivity: { type: Date },  
    profilePictureUrl: { type: String },  
    phoneNumber: { type: String },  
    permissions: { 
        type: [String], 
        default: [] 
    },  
    notes: { type: String, trim: true },  
}, 
{
    timestamps: true  
});

const TaskUser = mongoose.model('TaskUser', TaskUserSchema);
module.exports = TaskUser;
