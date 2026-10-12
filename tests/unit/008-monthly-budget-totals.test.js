const { test } = require('node:test');
const assert = require('node:assert/strict');
const Budget = require('../../app/domain.js');

const categories = [
  { id: 'c1', name: 'Groceries', budgeted: 30000 },
  { id: 'c2', name: 'Eating out', budgeted: 12000 },
  { id: 'c3', name: 'Transport', budgeted: 8000 },
];
const expenses = [
  { id: 'e1', amount: 5780, categoryId: 'c1', date: '2026-10-03', note: '' },
  { id: 'e2', amount: 6000, categoryId: 'c2', date: '2026-10-05', note: '' },
  { id: 'e3', amount: 10000, categoryId: 'c1', date: '2026-09-15', note: '' },
];

test('monthlyBudget is the sum of all budgeted amounts', () => {
  assert.equal(Budget.monthlyBudget(categories), 50000);
  assert.equal(Budget.monthlyBudget([]), 0);
});

test('totalsInMonth: empty case is all zero with no usage and not over budget', () => {
  assert.deepEqual(Budget.totalsInMonth([], [], '2026-10'),
    { monthlyBudget: 0, spent: 0, remaining: 0, usage: null, overBudget: false });
});

test('totalsInMonth: counts only expenses of the shown month', () => {
  assert.deepEqual(Budget.totalsInMonth(categories, expenses, '2026-10'),
    { monthlyBudget: 50000, spent: 11780, remaining: 38220, usage: 24, overBudget: false });
  assert.deepEqual(Budget.totalsInMonth(categories, expenses, '2026-09'),
    { monthlyBudget: 50000, spent: 10000, remaining: 40000, usage: 20, overBudget: false });
});

test('totalsInMonth: over budget gives negative remaining, usage above 100 % and overBudget true', () => {
  const eatingOut = [{ id: 'c2', name: 'Eating out', budgeted: 12000 }];
  const spent = [{ id: 'e1', amount: 15000, categoryId: 'c2', date: '2026-10-12', note: '' }];
  assert.deepEqual(Budget.totalsInMonth(eatingOut, spent, '2026-10'),
    { monthlyBudget: 12000, spent: 15000, remaining: -3000, usage: 125, overBudget: true });
});

test('totalsInMonth: spent equal to the monthly budget is not over budget', () => {
  const one = [{ id: 'c1', name: 'Groceries', budgeted: 5000 }];
  const spent = [{ id: 'e1', amount: 5000, categoryId: 'c1', date: '2026-10-12', note: '' }];
  const totals = Budget.totalsInMonth(one, spent, '2026-10');
  assert.equal(totals.usage, 100);
  assert.equal(totals.overBudget, false);
});

test('totalsInMonth: monthly budget 0 with spending has no usage but is over budget', () => {
  const zero = [{ id: 'c1', name: 'Transport', budgeted: 0 }];
  const spent = [{ id: 'e1', amount: 500, categoryId: 'c1', date: '2026-10-12', note: '' }];
  assert.deepEqual(Budget.totalsInMonth(zero, spent, '2026-10'),
    { monthlyBudget: 0, spent: 500, remaining: -500, usage: null, overBudget: true });
});

test('totalsInMonth: total spent is the sum of the categories\' spent (expenses without a category do not count)', () => {
  const orphan = [...expenses, { id: 'e9', amount: 999, categoryId: 'c99', date: '2026-10-01', note: '' }];
  assert.equal(Budget.totalsInMonth(categories, orphan, '2026-10').spent, 11780);
});
