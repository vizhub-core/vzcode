import React, { useState } from 'react';

const CreateTaskList = ({ onSubmit }) => {
  const [taskData, setTaskData] = useState({
    id: '',
    name: '',
    description: '',
    completed: false,
    collaborators: []
  });

  const handleChange = (e) => {
    //TODO
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //TODO
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>ID:</label>
        <input type="number" name="id" value={taskData.id} onChange={handleChange} required />
      </div>
      <div>
        <label>Name:</label>
        <input type="text" name="name" value={taskData.name} onChange={handleChange} required />
      </div>
      <div>
        <label>Description:</label>
        <textarea name="description" value={taskData.description} onChange={handleChange} required />
      </div>
      <div>
        <label>Completed:</label>
        <input type="checkbox" name="completed" checked={taskData.completed} onChange={() => setTaskData(prevData => ({ ...prevData, completed: !prevData.completed }))} />
      </div>
      <div>
        <label>Collaborators:</label>
        <input type="text" name="collaborators" value={taskData.collaborators} onChange={handleChange} />
      </div>
      <button type="submit">Create Task</button>
    </form>
  );
};

export default CreateTaskList;
