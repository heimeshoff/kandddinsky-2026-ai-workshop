const { test } = require('node:test');
const assert = require('node:assert/strict');
const Budget = require('../../app/domain.js');

const categories = [{ id: 'c1', name: 'Groceries', budgeted: 30000 }];
const valid = { amount: 1000, categoryId: 'c1', date: '2026-10-12' };

const AMOUNT_NOT_POSITIVE = 'Expense amount must be greater than zero';
const AMOUNT_INVALID = 'Expense amount must be a valid amount in euros, e.g. 12.50';
const DATE_MISSING = 'Please choose a date';

test('expense error texts are fixed', () => {
  assert.equal(Budget.EXPENSE_ERRORS.amountNotPositive, AMOUNT_NOT_POSITIVE);
  assert.equal(Budget.EXPENSE_ERRORS.amountInvalid, AMOUNT_INVALID);
  assert.equal(Budget.EXPENSE_ERRORS.dateMissing, DATE_MISSING);
  assert.equal(typeof Budget.EXPENSE_ERRORS.categoryUnknown, 'string');
});

test('validateExpense rejects an amount of zero or less', () => {
  for (const amount of [0, -1, -500]) {
    assert.equal(Budget.validateExpense(categories, { ...valid, amount }), AMOUNT_NOT_POSITIVE, String(amount));
  }
});

test('validateExpense rejects an amount that is not integer cents', () => {
  for (const amount of [null, undefined, 12.5, NaN, '1000']) {
    assert.equal(Budget.validateExpense(categories, { ...valid, amount }), AMOUNT_INVALID, String(amount));
  }
});

test('validateExpense rejects an expense whose category id does not exist', () => {
  for (const categoryId of ['c9', '', null, undefined, 'Groceries']) {
    assert.equal(Budget.validateExpense(categories, { ...valid, categoryId }),
      Budget.EXPENSE_ERRORS.categoryUnknown, String(categoryId));
  }
  assert.equal(Budget.validateExpense([], valid), Budget.EXPENSE_ERRORS.categoryUnknown);
});

test('validateExpense rejects a missing or invalid date', () => {
  for (const date of ['', null, undefined, '2026-13-01', '2026-02-30', '12.10.2026']) {
    assert.equal(Budget.validateExpense(categories, { ...valid, date }), DATE_MISSING, String(date));
  }
});

test('validateExpense accepts a valid expense', () => {
  assert.equal(Budget.validateExpense(categories, valid), null);
  assert.equal(Budget.validateExpense(categories, { ...valid, amount: 1 }), null);
});

test('addExpenseFromInput returns the unchanged list and the error text on rejection', () => {
  const existing = Budget.addExpense([], categories, valid);
  const cases = [
    [{ amountText: '0', categoryId: 'c1', date: '2026-10-12' }, AMOUNT_NOT_POSITIVE],
    [{ amountText: '-5', categoryId: 'c1', date: '2026-10-12' }, AMOUNT_NOT_POSITIVE],
    [{ amountText: '', categoryId: 'c1', date: '2026-10-12' }, AMOUNT_INVALID],
    [{ amountText: 'abc', categoryId: 'c1', date: '2026-10-12' }, AMOUNT_INVALID],
    [{ amountText: '4.999', categoryId: 'c1', date: '2026-10-12' }, AMOUNT_INVALID],
    [{ amountText: '10', categoryId: 'c1', date: '' }, DATE_MISSING],
    [{ amountText: '10', categoryId: 'c9', date: '2026-10-12' }, Budget.EXPENSE_ERRORS.categoryUnknown],
  ];
  for (const [input, error] of cases) {
    const result = Budget.addExpenseFromInput(existing, categories, { ...input, note: '' });
    assert.equal(result.error, error, JSON.stringify(input));
    assert.equal(result.expenses, existing);
  }
});

test('addExpense throws instead of storing an invalid expense', () => {
  assert.throws(() => Budget.addExpense([], categories, { ...valid, amount: 0 }), /greater than zero/);
  assert.throws(() => Budget.addExpense([], categories, { ...valid, categoryId: 'c9' }));
  assert.throws(() => Budget.addExpense([], categories, { ...valid, date: '' }), /choose a date/);
});
