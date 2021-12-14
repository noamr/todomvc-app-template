interface Task {
    title: string;
    completed: boolean;
}

interface TaskModelObserver {
    onAdd(key: number, value: Task);
    onUpdate(key: number, value: Task);
    onRemove(key: number);
    onCountChange(count: {active: number, completed: number});
}

interface TaskModel {
    constructor(observer: TaskModelObserver);
    createTask(task: Task): void;
    updateTask(key: number, task: Task): void;
    deleteTask(key: number): void;
    clearCompleted(): void;
    markAll(completed: boolean): void;
}

