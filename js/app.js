import TaskListModel from './model.js';

const list = document.querySelector('.todo-list');
const {completedCount, activeCount, clearCompleted, toggleAll, filter} = document.forms.main.elements;
const applyFilter = () => { filter.value = location.hash.substr(2); };
window.onhashchange = window.onload = applyFilter;
window.addEventListener('submit', e => e.preventDefault(), {capture: true});

new MutationObserver(() => {
	completedCount.value = list.querySelectorAll('.task.completed').length;
	const count = list.querySelectorAll('.task:not(.completed)').length;
	activeCount.innerHTML = `<strong>${count}</strong> item${count === 1 ? '' : 's'} left`;
}).observe(list, {childList: true, subtree: true, attributes: true});

const update = (key, {title, completed}, form = document.forms[`task-${key}`]) => {
	form.classList.toggle('completed', !!completed);
	form.elements.completed.checked = !!completed;
	form.elements.titleLabel.value = form.elements.title.value = title;
	form.elements.title.blur();
}

const model = new TaskListModel({
	update,
	add: (key, value) => {
		const form = list.querySelector('template').content.cloneNode(true).firstElementChild
		const save = () => model.updateTask(key, Object.fromEntries(new FormData(form)));
		form.name = `task-${key}`;
		form.elements.completed.addEventListener('change', save);
		form.elements.titleLabel.addEventListener('dblclick', () => form.elements.title.focus());
		form.elements.destroy.addEventListener('click', () => model.deleteTask(key));
		form.addEventListener('submit', save);
		update(key, value, form);
		list.appendChild(form);
	},
	remove: key => document.forms[`task-${key}`].remove()
});

clearCompleted.addEventListener('click', () => model.deleteCompleted());
toggleAll.addEventListener('change', ({target: {checked}}) => model.toggleAll(checked));
document.forms.main.addEventListener('submit', () =>
	model.createTask({completed: false, title: document.forms.main.elements.title.value}));
