import { createIncomeStore } from './income.js';

const store = createIncomeStore(localStorage);
const shown = document.getElementById('income');
const input = document.getElementById('income-input');
const error = document.getElementById('income-error');

const render = () => { shown.textContent = store.display(); };

document.getElementById('income-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const r = store.set(input.value);
  error.textContent = r.ok ? '' : r.error;
  if (r.ok) input.value = '';
  render();
});
render();
