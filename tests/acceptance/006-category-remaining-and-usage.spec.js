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
  await expect(rowOf(page, name)).toHaveCount(1);
}

async function addExpense(page, { amount, category, date }) {
  await page.getByTestId('expense-amount-input').fill(amount);
  await page.getByTestId('expense-category-select').selectOption({ label: category });
  await page.getByTestId('expense-date-input').fill(date);
  await page.getByTestId('expense-add-button').click();
  await expect(page.getByTestId('expense-amount-input')).toHaveValue('');
}

function rowOf(page, name) {
  return page.getByTestId('category-row')
    .filter({ has: page.getByTestId('category-name').getByText(name, { exact: true }) });
}

async function expectRow(page, name, { spent, remaining, usage }) {
  const row = rowOf(page, name);
  if (spent !== undefined) await expect(row.getByTestId('category-spent')).toHaveText(spent);
  await expect(row.getByTestId('category-remaining')).toHaveText(remaining);
  await expect(row.getByTestId('category-usage')).toHaveText(usage);
}

async function groceriesWithTwoExpenses(page) {
  await addCategory(page, 'Groceries', '300.00');
  await addExpense(page, { amount: '45.50', category: 'Groceries', date: '2026-10-12' });
  await addExpense(page, { amount: '12.30', category: 'Groceries', date: '2026-10-03' });
}

test('AC1: Groceries (300.00) without expenses shows remaining €300.00 and usage 0%', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Groceries', '300.00');
  await page.reload(); // "when the app is opened"
  await expectRow(page, 'Groceries', { spent: '€0.00', remaining: '€300.00', usage: '0%' });
  expect(errors).toEqual([]);
});

test('AC2: Groceries (300.00) with 45.50 and 12.30 in October shows spent €57.80, remaining €242.20, usage 19%', async ({ page }) => {
  const errors = await start(page);
  await groceriesWithTwoExpenses(page);
  await expectRow(page, 'Groceries', { spent: '€57.80', remaining: '€242.20', usage: '19%' });
  expect(errors).toEqual([]);
});

test('AC3: Eating out (120.00) counts only the October expense: spent €60.00, remaining €60.00, usage 50%', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Eating out', '120.00');
  await addExpense(page, { amount: '60.00', category: 'Eating out', date: '2026-10-05' });
  await addExpense(page, { amount: '100.00', category: 'Eating out', date: '2026-09-20' });
  await page.reload();
  await expectRow(page, 'Eating out', { spent: '€60.00', remaining: '€60.00', usage: '50%' });
  expect(errors).toEqual([]);
});

test('AC4: Transport with budgeted amount 0 and no expenses shows remaining €0.00 and usage "–"', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Transport', '0');
  await page.reload();
  await expectRow(page, 'Transport', { spent: '€0.00', remaining: '€0.00', usage: '–' });
  expect(errors).toEqual([]);
});

test('AC5: after a reload the Groceries row still shows spent €57.80, remaining €242.20, usage 19%', async ({ page }) => {
  const errors = await start(page);
  await groceriesWithTwoExpenses(page);
  await expectRow(page, 'Groceries', { spent: '€57.80', remaining: '€242.20', usage: '19%' });
  await page.reload();
  await expectRow(page, 'Groceries', { spent: '€57.80', remaining: '€242.20', usage: '19%' });
  expect(errors).toEqual([]);
});
