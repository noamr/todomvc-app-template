export default class TaskListModel {
    #db = null;
    #client = null;
    constructor(client, options = {}) {
        this.#client = client;
        const request = indexedDB.open(options.dbName || 'todomvc', 1);
        request.addEventListener('error', event => { throw new Error(`Coult not open database: ${event}`) });

        request.addEventListener('upgradeneeded', event =>
            event.target.result.createObjectStore("tasks", {autoIncrement: true}));

        this.#db = new Promise(resolve => 
            request.addEventListener('success', ({target: {result}}) => resolve(result)));

        this.#db.then(db => {
            const store = db.transaction(["tasks"], "readonly").objectStore("tasks");
            const changes = [];
            store.openCursor().addEventListener('success', ({target}) => {
                if (!target.result) {
                    changes.forEach(([key, value]) => client.add(key, value));
                    return;
                }

                const {key, value} = target.result;

                changes.push([key, value]);
                target.result.continue();
            });
        });
    }

    async createTask(task) {
        return (await this.#db).transaction(["tasks"], "readwrite").objectStore('tasks').add(task).addEventListener('success', 
            ({target: {result}}) => this.#client.add(result, task));
    }

    async updateTask(key, {completed, title}) {
        const value = {completed: !!completed, title: title || ''}; 
        (await this.#db).transaction(["tasks"], "readwrite").objectStore('tasks').put(value, key);
        this.#client.update(key, value);
    }

    async deleteTask(key) {
        (await this.#db).transaction(["tasks"], "readwrite").objectStore('tasks').delete(key);
        this.#client.remove(key);
    }

    async deleteCompleted() {
        const store = (await this.#db).transaction(["tasks"], "readwrite").objectStore("tasks");
        const changes = [];
        store.openCursor().addEventListener('success', ({target: {result}}) => {
            if (!result) {
                changes.forEach(change => this.#client.remove(change));
                return;
            }

            if (result.value.completed) {
                store.delete(result.key);
                changes.push(result.key);
            }

            result.continue();
        });
    }

    async toggleAll(completed) {
        const store = (await this.#db).transaction(["tasks"], "readwrite").objectStore("tasks");
        const changes = [];
        store.openCursor().addEventListener('success', ({target: {result}}) => {
            if (!result) {
                changes.forEach(([key, value]) => this.#client.update(key, value))
                return;
            }

            if (result.value.completed !== completed) {
                result.value.completed = completed;
                store.put(result.value, result.key);
                changes.push([result.key, result.value]);
            }

            result.continue();
        });
    }
}
