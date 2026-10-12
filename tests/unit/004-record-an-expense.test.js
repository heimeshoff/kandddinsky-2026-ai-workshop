const { test } = require('node:test');
const assert = require('node:assert/strict');
const Budget = require('../../app/domain.js');

const groceries = { id: 'c1', name: 'Groceries', budgeted: 30000 };
const transport = { id: 'c2', name: 'Transport', budgeted: 8000 };
const categories = [groceries, transport];

test('monthOf returns the "YYYY-MM" month of a "YYYY-MM-DD" date', () => {
  assert.equal(Budget.monthOf('2026-10-12'), '2026-10');
  assert.equal(Budget.monthOf('2026-09-30'), '2026-09');
  assert.equal(Budget.monthOf('2026-11-01'), '2026-11');
});

test('toIsoDate formats a local Date as "YYYY-MM-DD"', () => {
  assert.equal(Budget.toIsoDate(new Date(2026, 9, 12, 10, 0)), '2026-10-12');
  assert.equal(Budget.toIsoDate(new Date(2026, 0, 1, 0, 0)), '2026-01-01');
  assert.equal(Budget.toIsoDate(new Date(2026, 11, 31, 23, 59)), '2026-12-31');
});

test('formatMonth shows English month name and year', () => {
  assert.equal(Budget.formatMonth('2026-10'), 'October 2026');
  assert.equal(Budget.formatMonth('2027-01'), 'January 2027');
  assert.equal(Budget.formatMonth('2026-12'), 'December 2026');
});

test('addExpense appends an expense referencing the category by id', () => {
  const expenses = Budget.addExpense([], categories, { amount: 4550, categoryId: 'c1', date: '2026-10-12', note: ' Weekly shop ' });
  assert.equal(expenses.length, 1);
  assert.deepEqual(expenses[0], { id: 'e1', amount: 4550, categoryId: 'c1', date: '2026-10-12', note: 'Weekly shop' });
  const more = Budget.addExpense(expenses, categories, { amount: 1230, categoryId: 'c1', date: '2026-10-03' });
  assert.equal(more.length, 2);
  assert.equal(more[1].id, 'e2');
  assert.equal(more[1].note, '');
  assert.equal(expenses.length, 1, 'input list is not mutated');
});

test('addExpense rejects amounts not greater than zero, unknown categories and bad dates', () => {
  assert.throws(() => Budget.addExpense([], categories, { amount: 0, categoryId: 'c1', date: '2026-10-12' }));
  assert.throws(() => Budget.addExpense([], categories, { amount: -100, categoryId: 'c1', date: '2026-10-12' }));
  assert.throws(() => Budget.addExpense([], categories, { amount: 12.5, categoryId: 'c1', date: '2026-10-12' }));
  assert.throws(() => Budget.addExpense([], categories, { amount: 100, categoryId: 'c9', date: '2026-10-12' }));
  assert.throws(() => Budget.addExpense([], categories, { amount: 100, categoryId: 'c1', date: '' }));
  assert.throws(() => Budget.addExpense([], categories, { amount: 100, categoryId: 'c1', date: '2026-13-01' }));
});

test('addExpenseFromInput parses the amount text and keeps the list unchanged on invalid input', () => {
  const ok = Budget.addExpenseFromInput([], categories, { amountText: '45.50', categoryId: 'c1', date: '2026-10-12', note: '' });
  assert.equal(ok.error, null);
  assert.equal(ok.expenses[0].amount, 4550);
  const bad = Budget.addExpenseFromInput([], categories, { amountText: 'abc', categoryId: 'c1', date: '2026-10-12', note: '' });
  assert.notEqual(bad.error, null);
  assert.deepEqual(bad.expenses, []);
});

function sample() {
  let e = [];
  e = Budget.addExpense(e, categories, { amount: 2000, categoryId: 'c1', date: '2026-09-30' }); // last day of previous month
  e = Budget.addExpense(e, categories, { amount: 1230, categoryId: 'c1', date: '2026-10-03' });
  e = Budget.addExpense(e, categories, { amount: 100, categoryId: 'c1', date: '2026-10-01' }); // first day of the month
  e = Budget.addExpense(e, categories, { amount: 4550, categoryId: 'c1', date: '2026-10-12' });
  e = Budget.addExpense(e, categories, { amount: 999, categoryId: 'c2', date: '2026-10-31' }); // last day of the month
  e = Budget.addExpense(e, categories, { amount: 1000, categoryId: 'c1', date: '2026-11-01' }); // first day of next month
  return e;
}

test('expensesInMonth keeps only the month, newest date first', () => {
  const list = Budget.expensesInMonth(sample(), '2026-10');
  assert.deepEqual(list.map((x) => x.date), ['2026-10-31', '2026-10-12', '2026-10-03', '2026-10-01']);
  assert.deepEqual(Budget.expensesInMonth(sample(), '2026-09').map((x) => x.date), ['2026-09-30']);
  assert.deepEqual(Budget.expensesInMonth(sample(), '2026-11').map((x) => x.date), ['2026-11-01']);
  assert.deepEqual(Budget.expensesInMonth(sample(), '2026-12'), []);
});

test('expensesInMonth puts the most recently recorded first on the same date', () => {
  let e = [];
  e = Budget.addExpense(e, categories, { amount: 100, categoryId: 'c1', date: '2026-10-12', note: 'first' });
  e = Budget.addExpense(e, categories, { amount: 200, categoryId: 'c1', date: '2026-10-12', note: 'second' });
  assert.deepEqual(Budget.expensesInMonth(e, '2026-10').map((x) => x.note), ['second', 'first']);
});

test('spentInMonth sums only the expenses of the category in the month (boundaries excluded)', () => {
  const e = sample();
  assert.equal(Budget.spentInMonth(e, 'c1', '2026-10'), 1230 + 100 + 4550);
  assert.equal(Budget.spentInMonth(e, 'c2', '2026-10'), 999);
  assert.equal(Budget.spentInMonth(e, 'c1', '2026-09'), 2000);
  assert.equal(Budget.spentInMonth(e, 'c1', '2026-11'), 1000);
  assert.equal(Budget.spentInMonth([], 'c1', '2026-10'), 0);
});
