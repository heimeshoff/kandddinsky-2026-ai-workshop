const { test } = require('node:test');
const assert = require('node:assert/strict');
const Budget = require('../../app/domain.js');

test('usagePercent: budgeted 0 has no usage (null)', () => {
  assert.equal(Budget.usagePercent(0, 0), null);
  assert.equal(Budget.usagePercent(500, 0), null);
});

test('usagePercent: 0 spent is 0 %, spent equal to budgeted is exactly 100 %', () => {
  assert.equal(Budget.usagePercent(0, 30000), 0);
  assert.equal(Budget.usagePercent(30000, 30000), 100);
});

test('usagePercent rounds to the nearest whole percent, half up', () => {
  assert.equal(Budget.usagePercent(5780, 30000), 19); // 19.27 %
  assert.equal(Budget.usagePercent(39, 200), 20); // 19.5 %
  assert.equal(Budget.usagePercent(1, 200), 1); // 0.5 %
  assert.equal(Budget.usagePercent(1, 300), 0); // 0.33 %
  assert.equal(Budget.usagePercent(2, 300), 1); // 0.67 %
  assert.equal(Budget.usagePercent(6000, 12000), 50);
});

test('usagePercent above budget is above 100 %', () => {
  assert.equal(Budget.usagePercent(15000, 12000), 125);
  assert.equal(Budget.usagePercent(30001, 30000), 100); // 100.003 % rounds to 100
});

test('usagePercent returns an integer', () => {
  assert.ok(Number.isInteger(Budget.usagePercent(5780, 30000)));
});

test('formatUsage shows a whole percent, or an en dash when there is no usage', () => {
  assert.equal(Budget.formatUsage(19), '19%');
  assert.equal(Budget.formatUsage(0), '0%');
  assert.equal(Budget.formatUsage(125), '125%');
  assert.equal(Budget.formatUsage(null), '–');
});

test('categoryInMonth: spent, remaining and usage of a category for the shown month only', () => {
  const eatingOut = { id: 'c2', name: 'Eating out', budgeted: 12000 };
  const expenses = [
    { id: 'e1', amount: 6000, categoryId: 'c2', date: '2026-10-05', note: '' },
    { id: 'e2', amount: 10000, categoryId: 'c2', date: '2026-09-20', note: '' },
    { id: 'e3', amount: 999, categoryId: 'c1', date: '2026-10-05', note: '' },
  ];
  assert.deepEqual(Budget.categoryInMonth(eatingOut, expenses, '2026-10'), { spent: 6000, remaining: 6000, usage: 50 });
  assert.deepEqual(Budget.categoryInMonth(eatingOut, expenses, '2026-09'), { spent: 10000, remaining: 2000, usage: 83 });
});

test('categoryInMonth: over budget gives negative remaining and usage above 100 %', () => {
  const transport = { id: 'c3', name: 'Transport', budgeted: 8000 };
  const expenses = [{ id: 'e1', amount: 10000, categoryId: 'c3', date: '2026-10-01', note: '' }];
  assert.deepEqual(Budget.categoryInMonth(transport, expenses, '2026-10'), { spent: 10000, remaining: -2000, usage: 125 });
});

test('categoryInMonth: budgeted 0 has remaining 0 and no usage', () => {
  const transport = { id: 'c3', name: 'Transport', budgeted: 0 };
  assert.deepEqual(Budget.categoryInMonth(transport, [], '2026-10'), { spent: 0, remaining: 0, usage: null });
});
