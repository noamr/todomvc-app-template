const uuidv4 = () => new Date().valueOf();

export default class TaskListModel {
    #client = null;
    #storageKey = null;
    #tasks = new Map();

    
    #updateCount() {
        const tasks = Array.from(this.#tasks.values());
        this.#client.onCountChange(tasks.reduce((count, task) => {
            ++(count[task.completed ? 'completed' : 'active']);
            return count;
        }, {active: 0, completed: 0}));
    }

    constructor(client, options = {}) {
        this.#storageKey = options.storageKey || 'todos-vanilla';
        this.#client = client;
        const asJson = localStorage.getItem(this.#storageKey); 
        if (!asJson)
            return;
        this.#tasks = new Map(JSON.parse(asJson));
        for (const [key, value] of this.#tasks.entries())
            this.#client.onAdd(key, value);
        this.#updateCount();
    }

    #validateTask(task) {
        task = {...task, title: task.title.trim()};
        return task.title.length ? task : null;
    }

    #save() {
        this.#updateCount();
        localStorage.setItem(this.#storageKey, JSON.stringify(Array.from(this.#tasks.entries())));
    }

    createTask(task) {
        task = this.#validateTask(task);
        if (!task)
            return;
        const key = uuidv4();
        this.#tasks.set(key, task);
        this.#client.onAdd(key, task);
        this.#save();
    }

    updateTask(key, task) {
        task = this.#validateTask(task);
        if (!task)
            this.deleteTask(key);

        this.#tasks.set(key, task);
        this.#client.onUpdate(key, task);
        this.#save();
    }

    deleteTask(key) {
        this.#tasks.delete(key);
        this.#client.onRemove(key);
        this.#save();
    }

    clearCompleted() {
        for (const [key, {completed}] of this.#tasks) {
            if (!completed)
                continue;

            this.#tasks.delete(key);
            this.#client.onRemove(key);
        }

        this.#save();
    }

    markAll(completed) {
        for (const [key, task] of this.#tasks) {
            if (completed === task.completed)
                continue;

            task.completed = !!completed;
            this.#client.onUpdate(key, task);
        }

        this.#save();
    }
}
