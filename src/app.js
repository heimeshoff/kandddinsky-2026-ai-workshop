import { createIncomeStore } from './income.js';
import { createCategoryStore } from './categories.js';
import { createExpenseStore } from './expenses.js';
import { formatEur } from './money.js';

const store = createIncomeStore(localStorage);
const shown = document.getElementById('income');
const input = document.getElementById('income-input');
const error = document.getElementById('income-error');

const label = document.getElementById('month');
const render = () => { label.textContent = store.label(); shown.textContent = store.display(); renderExpenses(); };
document.getElementById('prev-month').addEventListener('click', () => { store.previous(); error.textContent = ''; render(); });
document.getElementById('next-month').addEventListener('click', () => { store.next(); error.textContent = ''; render(); });

document.getElementById('income-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const r = store.set(input.value);
  error.textContent = r.ok ? '' : r.error;
  if (r.ok) input.value = '';
  render();
});

const expenses = createExpenseStore(localStorage);
const categories = createCategoryStore(localStorage);
const catList = document.getElementById('category-list');
const catInput = document.getElementById('category-input');
const catError = document.getElementById('category-error');

const renderCategories = () => {
  catList.replaceChildren(...expenses.spentByCategory(store.month(), categories.list()).map(({ name, cents }) => {
    const li = document.createElement('li');
    li.textContent = `${name}: ${formatEur(cents)}`;
    return li;
  }));
};

document.getElementById('category-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const r = categories.add(catInput.value);
  catError.textContent = r.ok ? '' : r.error;
  if (r.ok) catInput.value = '';
  renderCategories();
  renderCategoryOptions();
});

const expList = document.getElementById('expense-list');
const spent = document.getElementById('spent');
const expAmount = document.getElementById('expense-amount');
const expCategory = document.getElementById('expense-category');
const expDate = document.getElementById('expense-date');
const expNote = document.getElementById('expense-note');
const expError = document.getElementById('expense-error');
expDate.value = expenses.defaultDate();

function renderExpenses() {
  const month = store.month();
  spent.textContent = formatEur(expenses.spentCents(month));
  renderCategories();
  expList.replaceChildren(...expenses.list(month).map((e, i) => {
    const li = document.createElement('li');
    li.textContent = `${formatEur(e.cents)} ${e.category} ${e.date}${e.note ? ' ' + e.note : ''}`;
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Delete';
    del.addEventListener('click', () => { expenses.remove(month, i); renderExpenses(); });
    li.append(' ', del);
    return li;
  }));
}
function renderCategoryOptions() {
  const current = expCategory.value;
  expCategory.replaceChildren(...categories.list().map((name) => new Option(name, name)));
  if (current) expCategory.value = current;
  const none = categories.list().length === 0;
  document.getElementById('expense-hint').hidden = !none;
  document.getElementById('expense-submit').disabled = none;
}

document.getElementById('expense-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const r = expenses.add({ amount: expAmount.value, category: expCategory.value, date: expDate.value, note: expNote.value });
  expError.textContent = r.ok ? '' : r.error;
  if (r.ok) { expAmount.value = ''; expNote.value = ''; }
  renderExpenses();
});
renderCategoryOptions();
render();
