const { test } = require('node:test');
const assert = require('node:assert/strict');
const Budget = require('../../app/domain.js');

test('isOverBudget: spent greater than budgeted is over budget', () => {
  assert.equal(Budget.isOverBudget(15000, 12000), true);
  assert.equal(Budget.isOverBudget(30001, 30000), true);
});

test('isOverBudget: spent equal to budgeted is not over budget', () => {
  assert.equal(Budget.isOverBudget(30000, 30000), false);
});

test('isOverBudget: spent below budgeted is not over budget', () => {
  assert.equal(Budget.isOverBudget(0, 30000), false);
  assert.equal(Budget.isOverBudget(29999, 30000), false);
});

test('isOverBudget: zero budget is over budget as soon as anything is spent', () => {
  assert.equal(Budget.isOverBudget(0, 0), false);
  assert.equal(Budget.isOverBudget(500, 0), true);
});

test('isCategoryOverBudget: per category and month, only the shown month counts', () => {
  const eatingOut = { id: 'c1', name: 'Eating out', budgeted: 12000 };
  const expenses = [
    { id: 'e1', amount: 15000, categoryId: 'c1', date: '2026-10-12', note: '' },
    { id: 'e2', amount: 5000, categoryId: 'c1', date: '2026-09-12', note: '' },
  ];
  assert.equal(Budget.isCategoryOverBudget(eatingOut, expenses, '2026-10'), true);
  assert.equal(Budget.isCategoryOverBudget(eatingOut, expenses, '2026-09'), false);
  assert.equal(Budget.isCategoryOverBudget(eatingOut, expenses, '2026-11'), false);
});
