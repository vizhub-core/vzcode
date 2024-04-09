import React, { useState } from 'react';
import { assert } from 'vitest';
import Task from "./task.schema";
import TaskList from "./taskList.schema";

interface NewTaskFormProps {
  onCreateTask: (task) => void;
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({ onCreateTask }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);

  //Just returns a random number, will have to fix this later

  const generateUniqueId() {
    return Math.floor(Math.random() * 100000) + 1;
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: generateUniqueId(),  
      name,
      description,
      completed,
      collaborators,
    };
    onCreateTask(newTask);
    setName('');
    setDescription('');
    setCompleted(false);
    setCollaborators([]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <label>
        Completed:
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
        />
      </label>
      <label>
        Collaborators (comma-separated):
        <input
          type="text"
          value={collaborators.join(',')}
          onChange={(e) => setCollaborators(e.target.value.split(','))}
        />
      </label>
      <button type="submit">Create Task</button>
    </form>
  );
};

//Adds a newly creaetd task to the tasklist
const appendTask(task) {
  const taskList = getTaskList(); //will have to implement getTaskList soon

  const prev_length = taskList.length;

  //add it
  taskList.addTask(task);

  const new_length = taskList.length;
  assert(new_length - 1 == prev_length);
}
export default NewTaskForm;
