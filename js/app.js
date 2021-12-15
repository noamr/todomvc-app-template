import TaskListModel from './model.js';

const list = document.querySelector('.todo-list');
const {completedCount, totalCount, activeCount, clearCompleted, toggleAll, filter} = document.forms.main.elements;
window.onhashchange = window.onload = () => { filter.value = location.hash.substr(2); };
document.addEventListener('submit', e => e.preventDefault(), {capture: true});
const formData = form => Object.fromEntries(new FormData(form));

const model = new TaskListModel(new class {
	onAdd(key, value) {
		const form = list.querySelector('template').content.cloneNode(true).firstElementChild;
		form.name = `task-${key}`;
		form.elements.completed.onchange = form.onsubmit = () => model.updateTask(key, formData(form));
		form.elements.title.addEventListener('dblclick', ({target}) => target.removeAttribute('readonly'));
		form.elements.title.addEventListener('blur', ({target}) => target.setAttribute('readonly', ''));
		form.elements.destroy.addEventListener('click', () => model.deleteTask(key));
		this.onUpdate(key, value, form);
		list.appendChild(form);
	}

	onUpdate(key, {title, completed}, form = document.forms[`task-${key}`]) {
		form.elements.completed.checked = !!completed;
		form.elements.title.value = title;
		form.elements.title.blur();
	}

	onRemove(key) { document.forms[`task-${key}`].remove(); }
	onCountChange({active, completed}) {
		completedCount.value = completed;
		toggleAll.checked = active === 0;
		totalCount.value = active + completed;
		activeCount.innerHTML = `<strong>${active}</strong> item${active === 1 ? '' : 's'} left`;
	}
});

document.forms.new.addEventListener('submit', ({target}) => model.createTask(formData(target)));
toggleAll.addEventListener('change', e => model.markAll(e.target.checked));
clearCompleted.addEventListener('click', e => model.clearCompleted());
