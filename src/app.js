import { createIncomeStore } from './income.js';
import { createCategoryStore } from './categories.js';
import { createExpenseStore } from './expenses.js';
import { createBudgetStore } from './budgets.js';
import { formatEur } from './money.js';

const store = createIncomeStore(localStorage);
const shown = document.getElementById('income');
const input = document.getElementById('income-input');
const error = document.getElementById('income-error');

const label = document.getElementById('month');
const render = () => { label.textContent = store.label(); shown.textContent = store.display(); renderExpenses(); };
document.getElementById('prev-month').addEventListener('click', () => { editing = null; store.previous(); error.textContent = ''; render(); });
document.getElementById('next-month').addEventListener('click', () => { editing = null; store.next(); error.textContent = ''; render(); });

document.getElementById('income-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const r = store.set(input.value);
  error.textContent = r.ok ? '' : r.error;
  if (r.ok) input.value = '';
  render();
});

const expenses = createExpenseStore(localStorage);
const categories = createCategoryStore(localStorage);
const budgets = createBudgetStore(localStorage);
const catList = document.getElementById('category-list');
const catInput = document.getElementById('category-input');
const catError = document.getElementById('category-error');

let renamingCat = null;
function renameRow(name) {
  const li = document.createElement('li');
  const inp = Object.assign(document.createElement('input'), { type: 'text', value: name });
  inp.setAttribute('aria-label', 'Rename category');
  const err = document.createElement('span');
  err.setAttribute('role', 'alert');
  const save = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Save' });
  save.addEventListener('click', () => {
    const r = categories.rename(name, inp.value);
    if (!r.ok) { err.textContent = r.error; return; }
    expenses.renameCategory(name, r.name);
    budgets.rename(name, r.name);
    renamingCat = null; renderExpenses(); renderCategoryOptions();
  });
  const cancel = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Cancel' });
  cancel.addEventListener('click', () => { renamingCat = null; renderCategories(); });
  li.append(inp, ' ', save, ' ', cancel, ' ', err);
  return li;
}
const renderCategories = () => {
  const avg = expenses.averageByCategory(categories.list());
  const proj = expenses.projectedByCategory(store.month(), categories.list());
  catList.replaceChildren(...expenses.spentByCategory(store.month(), categories.list()).map(({ name, cents }, i) => {
    const li = document.createElement('li');
    if (renamingCat === name) return renameRow(name);
    li.textContent = `${name}: ${formatEur(cents)} (average ${avg[i].display})${proj[i].display === null ? '' : `, projected ${proj[i].display}`} `;
    const btn = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Rename' });
    btn.addEventListener('click', () => { renamingCat = name; renderCategories(); });
    li.append(btn);
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Delete';
    del.setAttribute('aria-label', `Delete category ${name}`);
    del.addEventListener('click', () => deleteCategory(name));
    li.append(' ', del);
    li.append(' ', budgetControls(name));
    return li;
  }));
};

function budgetControls(name) {
  const month = store.month();
  const box = document.createElement('span');
  const inp = Object.assign(document.createElement('input'), { type: 'text' });
  inp.setAttribute('aria-label', `Budget for ${name}`);
  const err = document.createElement('span');
  err.setAttribute('role', 'alert');
  const set = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Set budget' });
  set.addEventListener('click', () => {
    const r = budgets.set(name, month, inp.value);
    if (!r.ok) { err.textContent = r.error; return; }
    renderCategories();
  });
  const rem = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Remove budget' });
  rem.setAttribute('aria-label', `Remove budget of ${name}`);
  rem.addEventListener('click', () => { budgets.remove(name, month); renderCategories(); });
  const label = document.createElement('span');
  label.textContent = `Budget: ${budgets.display(name, month)} `;
  box.append(label, inp, ' ', set);
  if (budgets.cents(name, month) !== null) box.append(' ', rem);
  box.append(' ', err);
  return box;
}

function deleteCategory(name) {
  const n = expenses.countByCategory(name);
  if (n > 0 && !confirm(`Deleting "${name}" will also delete ${n} expense${n === 1 ? '' : 's'}. Continue?`)) return;
  expenses.removeByCategory(name);
  categories.remove(name);
  budgets.removeCategory(name);
  editing = null;
  renderCategoryOptions();
  renderExpenses();
}

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
let editing = null; // { month, position } of the expense being edited
const centsToText = (c) => (c / 100).toFixed(2);

function renderExpenses() {
  const month = store.month();
  spent.textContent = formatEur(expenses.spentCents(month));
  renderCategories();
  const b = expenses.balance(month, categories.list(), store.cents());
  document.getElementById('balance-label').textContent = b.kind === 'left' ? 'Left' : 'Projected balance';
  const bEl = document.getElementById('balance');
  bEl.textContent = b.display;
  bEl.style.color = b.negative ? 'red' : '';
  bEl.style.fontWeight = b.negative ? 'bold' : '';
  expList.replaceChildren(...expenses.list(month).map((e, i) => {
    const li = document.createElement('li');
    if (editing && editing.month === month && editing.position === i) return editRow(e, month, i);
    li.textContent = `${formatEur(e.cents)} ${e.category} ${e.date}${e.note ? ' ' + e.note : ''}`;
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => { editing = { month, position: i }; renderExpenses(); });
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Delete';
    del.addEventListener('click', () => { editing = null; expenses.remove(month, i); renderExpenses(); });
    li.append(' ', edit, ' ', del);
    return li;
  }));
}
function editRow(e, month, i) {
  const li = document.createElement('li');
  const field = (el, label) => { el.setAttribute('aria-label', label); return el; };
  const amount = field(Object.assign(document.createElement('input'), { type: 'text', value: centsToText(e.cents) }), 'Edit amount');
  const cat = field(document.createElement('select'), 'Edit category');
  const names = categories.list().includes(e.category) ? categories.list() : [...categories.list(), e.category];
  cat.replaceChildren(...names.map((n) => new Option(n, n)));
  cat.value = e.category;
  const date = field(Object.assign(document.createElement('input'), { type: 'date', value: e.date }), 'Edit date');
  const note = field(Object.assign(document.createElement('input'), { type: 'text', value: e.note ?? '' }), 'Edit note');
  const err = document.createElement('span');
  err.setAttribute('role', 'alert');
  const save = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Save' });
  save.addEventListener('click', () => {
    const r = expenses.update(month, i, { amount: amount.value, category: cat.value, date: date.value, note: note.value });
    if (!r.ok) { err.textContent = r.error; return; }
    editing = null; renderExpenses();
  });
  const cancel = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Cancel' });
  cancel.addEventListener('click', () => { editing = null; renderExpenses(); });
  li.append(amount, ' ', cat, ' ', date, ' ', note, ' ', save, ' ', cancel, ' ', err);
  return li;
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
