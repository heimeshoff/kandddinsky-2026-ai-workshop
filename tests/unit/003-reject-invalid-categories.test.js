const { test } = require('node:test');
const assert = require('node:assert/strict');
const Budget = require('../../app/domain.js');

const groceries = [{ id: 'c1', name: 'Groceries', budgeted: 30000 }];

test('validateCategory rejects an empty or blank name', () => {
  for (const name of ['', '   ', null, undefined]) {
    assert.equal(Budget.validateCategory([], name, 10000), Budget.ERRORS.nameEmpty, String(name));
  }
  assert.equal(Budget.ERRORS.nameEmpty, 'Category name must not be empty');
});

test('validateCategory rejects a duplicate name ignoring case and surrounding spaces, naming the stored category', () => {
  for (const name of ['Groceries', 'groceries', ' GROCERIES ']) {
    assert.equal(Budget.validateCategory(groceries, name, 5000), 'A category named "Groceries" already exists', name);
  }
});

test('validateCategory rejects a negative budgeted amount', () => {
  assert.equal(Budget.validateCategory([], 'Groceries', -1000), 'Budgeted amount must be zero or more');
});

test('validateCategory rejects a budgeted amount that is not integer cents', () => {
  for (const b of [null, undefined, 12.5, NaN, '300']) {
    assert.equal(Budget.validateCategory([], 'Groceries', b),
      'Budgeted amount must be a valid amount in euros, e.g. 300 or 12.50', String(b));
  }
});

test('validateCategory accepts a valid new category, including zero budget', () => {
  assert.equal(Budget.validateCategory([], 'Groceries', 30000), null);
  assert.equal(Budget.validateCategory(groceries, 'Transport', 0), null);
});

test('addCategory throws on invalid input instead of storing it', () => {
  assert.throws(() => Budget.addCategory([], '  ', 100), /must not be empty/);
  assert.throws(() => Budget.addCategory([], 'X', -100), /zero or more/);
  assert.throws(() => Budget.addCategory(groceries, 'groceries', 100), /already exists/);
});

test('addCategoryFromInput parses the amount text and returns categories or an error', () => {
  const ok = Budget.addCategoryFromInput([], ' Groceries ', '300');
  assert.equal(ok.error, null);
  assert.deepEqual(ok.categories.map((c) => [c.name, c.budgeted]), [['Groceries', 30000]]);

  const cases = [
    [[], '   ', '100', 'Category name must not be empty'],
    [groceries, 'groceries', '50', 'A category named "Groceries" already exists'],
    [[], 'Groceries', '-10', 'Budgeted amount must be zero or more'],
    [[], 'Groceries', '', 'Budgeted amount must be a valid amount in euros, e.g. 300 or 12.50'],
    [[], 'Groceries', 'abc', 'Budgeted amount must be a valid amount in euros, e.g. 300 or 12.50'],
    [[], 'Groceries', '12.345', 'Budgeted amount must be a valid amount in euros, e.g. 300 or 12.50'],
  ];
  for (const [list, name, amount, error] of cases) {
    const result = Budget.addCategoryFromInput(list, name, amount);
    assert.equal(result.error, error, `${name}/${amount}`);
    assert.equal(result.categories, list);
  }
});
