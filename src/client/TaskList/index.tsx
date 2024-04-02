import { useState } from "react";
import TaskList from "./taskList";

function TaskListComponent() {

    //TODO
    function handleSubmit() {[

    ]}

    //All the states necessary to initialize a task
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [completed, setCompleted] = useState(false);
    const [collaborators, setCollaborators] = useState<string[]>([]);
  
    //Create a form to create a new task
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
}

