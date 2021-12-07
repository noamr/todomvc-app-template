export default async function createTaskListModel(client, options = {}) {
    const request = indexedDB.open(options.dbName || 'todomvc', 1);
    request.addEventListener('error', event => { throw new Error(`Coult not open database: ${event}`) });

    request.addEventListener('upgradeneeded', event =>
        event.target.result.createObjectStore("tasks", {autoIncrement: true}));

    const db = await new Promise(resolve => 
        request.addEventListener('success', ({target: {result}}) => resolve(result)));

    const store = db.transaction(["tasks"], "readonly").objectStore("tasks");
    const changes = [];
    await new Promise(resolve => store.openCursor().addEventListener('success', ({target}) => {
        if (!target.result) {
            changes.forEach(([key, value]) => client.add(key, value));
            resolve();
            return;
        }

        const {key, value} = target.result;

        changes.push([key, value]);
        target.result.continue();
    }));

    return {
        createTask: task => db.transaction(["tasks"], "readwrite").objectStore('tasks').add(task).addEventListener('success', 
            ({target: {result}}) => client.add(result, task)),

        updateTask: (key, {completed, title}) => {
            const value = {completed: !!completed, title: title || ''}; 
            db.transaction(["tasks"], "readwrite").objectStore('tasks').put(value, key);
            client.update(key, value);
        },

        deleteTask: key => {
            db.transaction(["tasks"], "readwrite").objectStore('tasks').delete(key);
            client.remove(key);
        },

        deleteCompleted: () => {
            const store = db.transaction(["tasks"], "readwrite").objectStore("tasks");
            const changes = [];
            store.openCursor().addEventListener('success', ({target: {result}}) => {
                if (!result) {
                    changes.forEach(change => client.remove(change));
                    return;
                }

                if (result.value.completed) {
                    store.delete(result.key);
                    changes.push(result.key);
                }

                result.continue();
            });
        },

        toggleAll: completed => {
            const store = db.transaction(["tasks"], "readwrite").objectStore("tasks");
            const changes = [];
            store.openCursor().addEventListener('success', ({target: {result}}) => {
                if (!result) {
                    changes.forEach(([key, value]) => client.update(key, value))
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
}
