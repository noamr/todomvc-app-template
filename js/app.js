import createTaskListModel from './model.js';

const app = document.querySelector('.todoapp');
const list = app.querySelector('.todo-list');
const formValues = form => Object.fromEntries(new FormData(form));
const updateFilterFromHash = () => { app.dataset.filter = location.hash.substr(2); }
window.addEventListener('hashchange', updateFilterFromHash);
updateFilterFromHash();
const item = key => list.querySelector(`li#task-${key}`);
const mainForm = document.forms.main;
const update = (key, value, element = item(key), form = element.querySelector('form')) => {
	element.classList.toggle('completed', !!value.completed);
	form.elements.completed.checked = !!value.completed;
	element.querySelector('label').innerHTML = form.elements.title.value = value.title;
	updateCount();
}

const updateEditing = e =>
	list.querySelectorAll('.task').forEach(t => t.classList.toggle('editing', t === e));

function updateCount() {
	const count = app.dataset.activeCount = app.querySelectorAll('.task:not(.completed)').length;
	app.dataset.completedCount = app.querySelectorAll('.task.completed').length;
	app.querySelector('.todo-count').innerHTML = `<strong>${count}</strong> item${count === 1 ? '' : 's'} left`;
}

const model = await createTaskListModel({
	update,
	remove: key => {
		item(key).remove();
		updateCount();
	},

	add: (key, value) => {
		const element = list.querySelector('template').content.cloneNode(true).firstElementChild
		element.id = `task-${key}`;
		const form = element.querySelector('form');
		form.elements.completed.addEventListener('change', e =>
			model.updateTask(key, formValues(e.target.form)));

		form.querySelector('label').addEventListener('dblclick', () => {
			updateEditing(element);
			element.querySelector('.edit').focus();
		});

		form.addEventListener('submit', e => {
			if (e.submitter.name === 'destroy')
				model.deleteTask(key);
			else
				model.updateTask(key, formValues(e.target));
			updateEditing(null);
			e.preventDefault();
		});

		element.querySelector('.edit').addEventListener('blur', () => updateEditing(null));
		update(key, value, element);
		list.appendChild(element);
		updateCount();
	},
});

mainForm.elements.clearCompleted.addEventListener('click', () => model.deleteCompleted());
mainForm.elements.toggleAll.addEventListener('change', e => model.toggleAll(e.target.checked));
mainForm.addEventListener('submit', e => {
	model.createTask(formValues(e.target));
	e.preventDefault();
});
