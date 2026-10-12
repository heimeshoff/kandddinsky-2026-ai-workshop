const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

async function start(page) {
  await page.clock.setFixedTime(new Date('2026-10-12T10:00:00'));
  return openApp(page);
}

async function addCategory(page, name, budget) {
  await page.getByTestId('category-name-input').fill(name);
  await page.getByTestId('category-budget-input').fill(budget);
  await page.getByTestId('category-add-button').click();
  await expect(page.getByTestId('category-name').getByText(name, { exact: true })).toHaveCount(1);
}

async function addExpense(page, { amount, category, date }) {
  await page.getByTestId('expense-amount-input').fill(amount);
  await page.getByTestId('expense-category-select').selectOption({ label: category });
  await page.getByTestId('expense-date-input').fill(date);
  await page.getByTestId('expense-add-button').click();
  await expect(page.getByTestId('expense-amount-input')).toHaveValue('');
}

async function expectTotals(page, { budget, spent, remaining, usage }) {
  await expect(page.getByTestId('total-monthly-budget')).toHaveText(budget);
  await expect(page.getByTestId('total-spent')).toHaveText(spent);
  await expect(page.getByTestId('total-remaining')).toHaveText(remaining);
  await expect(page.getByTestId('total-usage')).toHaveText(usage);
}

async function stateOfAC2(page) {
  await addCategory(page, 'Groceries', '300.00');
  await addCategory(page, 'Eating out', '120.00');
  await addCategory(page, 'Transport', '80.00');
  await addExpense(page, { amount: '57.80', category: 'Groceries', date: '2026-10-03' });
  await addExpense(page, { amount: '60.00', category: 'Eating out', date: '2026-10-05' });
}

const AC2_TOTALS = { budget: '€500.00', spent: '€117.80', remaining: '€382.20', usage: '24%' };

test('AC1: with empty storage the totals show €0.00, €0.00, €0.00 and usage "–"', async ({ page }) => {
  const errors = await start(page);
  await expectTotals(page, { budget: '€0.00', spent: '€0.00', remaining: '€0.00', usage: '–' });
  expect(errors).toEqual([]);
});

test('AC2: three categories with October expenses show monthly budget €500.00, spent €117.80, remaining €382.20, usage 24%', async ({ page }) => {
  const errors = await start(page);
  await stateOfAC2(page);
  await page.reload(); // "when the app is opened"
  await expectTotals(page, AC2_TOTALS);
  expect(errors).toEqual([]);
});

test('AC3: an expense dated in September leaves the October totals unchanged', async ({ page }) => {
  const errors = await start(page);
  await stateOfAC2(page);
  await expectTotals(page, AC2_TOTALS);
  await addExpense(page, { amount: '100.00', category: 'Groceries', date: '2026-09-15' });
  await expectTotals(page, AC2_TOTALS);
  expect(errors).toEqual([]);
});

test('AC4: over the monthly budget shows remaining -€30.00, usage 125% and data-over-budget="true"; in AC2 state "false"', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Eating out', '120.00');
  await addExpense(page, { amount: '150.00', category: 'Eating out', date: '2026-10-12' });
  await page.reload();
  await expect(page.getByTestId('total-remaining')).toHaveText('-€30.00');
  await expect(page.getByTestId('total-usage')).toHaveText('125%');
  await expect(page.getByTestId('totals')).toHaveAttribute('data-over-budget', 'true');

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await stateOfAC2(page);
  await page.reload();
  await expectTotals(page, AC2_TOTALS);
  await expect(page.getByTestId('totals')).toHaveAttribute('data-over-budget', 'false');
  expect(errors).toEqual([]);
});

test('AC5: adding a category and an expense updates the totals without reload, and they survive a reload', async ({ page }) => {
  const errors = await start(page);
  await stateOfAC2(page);
  await addCategory(page, 'Gifts', '50.00');
  await addExpense(page, { amount: '10.00', category: 'Transport', date: '2026-10-12' });
  const expected = { budget: '€550.00', spent: '€127.80', remaining: '€422.20', usage: '23%' };
  await expectTotals(page, expected);
  await page.reload();
  await expectTotals(page, expected);
  expect(errors).toEqual([]);
});
