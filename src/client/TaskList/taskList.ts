interface Task {
    id: number;
    name: string;
    description: string;
    completed: boolean;
    collaborators: string[]
}

class TaskList {
    private tasks: Task[];

    constructor() {
        this.tasks = [];
    }

    // Method to add a new task
    addTask(task: Task): void {
        this.tasks.push(task);
    }

    // Method to remove a task by ID
    removeTaskById(id: number): void {
        this.tasks = this.tasks.filter(task => task.id !== id);
    }

    // Method to mark a task as completed by ID
    markTaskCompletedById(id: number): void {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].completed = true;
        }
    }

    // Method to list all tasks
    listTasks(): Task[] {
        return this.tasks;
    }
}