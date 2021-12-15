import TaskListModel from './model.js';

const model = new TaskListModel(new class {
	onAdd(key, value) {
		const form = document.querySelector('.todo-list template').content.cloneNode(true).firstElementChild;
		form.name = `task-${key}`;
		form.elements.completed.onchange = form.onsubmit = () => model.updateTask(key,  Object.fromEntries(new FormData(form)));
		form.elements.title.addEventListener('dblclick', ({target}) => target.removeAttribute('readonly'));
		form.elements.title.addEventListener('blur', ({target}) => target.setAttribute('readonly', ''));
		form.elements.destroy.addEventListener('click', () => model.deleteTask(key));
		this.onUpdate(key, value, form);
		document.querySelector('.todo-list').appendChild(form);
	}

	onUpdate(key, {title, completed}, form = document.forms[`task-${key}`]) {
		form.elements.completed.checked = !!completed;
		form.elements.title.value = title;
		form.elements.title.blur();
	}

	onRemove(key) { document.forms[`task-${key}`].remove(); }
	onCountChange({active, completed}) {
		document.forms.main.elements.completedCount.value = completed;
		document.forms.main.elements.toggleAll.checked = active === 0;
		document.forms.main.elements.totalCount.value = active + completed;
		document.forms.main.elements.activeCount.innerHTML = `<strong>${active}</strong> item${active === 1 ? '' : 's'} left`;
	}
});

const updateFilter = () => document.forms.main.elements.filter.setAttribute('value', location.hash.substr(2));
window.addEventListener('hashchange', updateFilter);
window.addEventListener('load', updateFilter);
document.querySelector('.todoapp').addEventListener('submit', e => e.preventDefault(), {capture: true});
document.forms.new.addEventListener('submit', ({target: {elements: {title}}}) => model.createTask({title}));
document.forms.main.elements.toggleAll.addEventListener('change', ({target: {checked}})=> model.markAll(checked));
document.forms.main.elements.clearCompleted.addEventListener('click', () => model.clearCompleted());