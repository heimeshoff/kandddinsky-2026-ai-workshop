import { createIncomeStore } from './income.js';
import { createCategoryStore } from './categories.js';

const store = createIncomeStore(localStorage);
const shown = document.getElementById('income');
const input = document.getElementById('income-input');
const error = document.getElementById('income-error');

const label = document.getElementById('month');
const render = () => { label.textContent = store.label(); shown.textContent = store.display(); };
document.getElementById('prev-month').addEventListener('click', () => { store.previous(); error.textContent = ''; render(); });
document.getElementById('next-month').addEventListener('click', () => { store.next(); error.textContent = ''; render(); });

document.getElementById('income-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const r = store.set(input.value);
  error.textContent = r.ok ? '' : r.error;
  if (r.ok) input.value = '';
  render();
});
render();

const categories = createCategoryStore(localStorage);
const catList = document.getElementById('category-list');
const catInput = document.getElementById('category-input');
const catError = document.getElementById('category-error');

const renderCategories = () => {
  catList.replaceChildren(...categories.list().map((name) => {
    const li = document.createElement('li');
    li.textContent = name;
    return li;
  }));
};

document.getElementById('category-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const r = categories.add(catInput.value);
  catError.textContent = r.ok ? '' : r.error;
  if (r.ok) catInput.value = '';
  renderCategories();
});
renderCategories();
