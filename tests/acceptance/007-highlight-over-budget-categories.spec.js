const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

async function start(page) {
  await page.clock.setFixedTime(new Date('2026-10-12T10:00:00'));
  return openApp(page);
}

function rowOf(page, name) {
  return page.getByTestId('category-row')
    .filter({ has: page.getByTestId('category-name').getByText(name, { exact: true }) });
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

async function eatingOutOverBudget(page) {
  await addCategory(page, 'Eating out', '120.00');
  await addExpense(page, { amount: '150.00', category: 'Eating out', date: '2026-10-12' });
}

async function expectOverBudget(page, name) {
  const row = rowOf(page, name);
  await expect(row).toHaveAttribute('data-over-budget', 'true');
  await expect(row.getByTestId('category-over-budget')).toBeVisible();
  await expect(row.getByTestId('category-over-budget')).toHaveText('Over budget');
}

async function expectWithinBudget(page, name) {
  const row = rowOf(page, name);
  await expect(row).toHaveAttribute('data-over-budget', 'false');
  await expect(row.getByTestId('category-over-budget')).not.toBeVisible();
}

test('AC1: an expense of 150.00 for Eating out (120.00) is recorded; spent €150.00, remaining -€30.00, usage 125%', async ({ page }) => {
  const errors = await start(page);
  await eatingOutOverBudget(page);
  await expect(page.getByTestId('expense-row').filter({ hasText: '€150.00' })).toHaveCount(1);
  const row = rowOf(page, 'Eating out');
  await expect(row.getByTestId('category-spent')).toHaveText('€150.00');
  await expect(row.getByTestId('category-remaining')).toHaveText('-€30.00');
  await expect(row.getByTestId('category-usage')).toHaveText('125%');
  expect(errors).toEqual([]);
});

test('AC2: Eating out is marked over budget with a label and a different remaining colour; Groceries is not', async ({ page }) => {
  const errors = await start(page);
  await eatingOutOverBudget(page);
  await addCategory(page, 'Groceries', '300.00');
  await page.reload(); // "when the app is opened"
  await expectOverBudget(page, 'Eating out');
  await expectWithinBudget(page, 'Groceries');
  const colorOf = (name) => rowOf(page, name).getByTestId('category-remaining')
    .evaluate((el) => getComputedStyle(el).color);
  expect(await colorOf('Eating out')).not.toBe(await colorOf('Groceries'));
  expect(errors).toEqual([]);
});

test('AC3: Groceries (300.00) with exactly 300.00 spent shows €0.00, 100% and is not over budget', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Groceries', '300.00');
  await addExpense(page, { amount: '200.00', category: 'Groceries', date: '2026-10-03' });
  await addExpense(page, { amount: '100.00', category: 'Groceries', date: '2026-10-12' });
  await page.reload();
  const row = rowOf(page, 'Groceries');
  await expect(row.getByTestId('category-remaining')).toHaveText('€0.00');
  await expect(row.getByTestId('category-usage')).toHaveText('100%');
  await expectWithinBudget(page, 'Groceries');
  expect(errors).toEqual([]);
});

test('AC4: Transport with budgeted amount 0 and an expense of 5.00 shows -€5.00, usage "–" and is over budget', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Transport', '0');
  await addExpense(page, { amount: '5.00', category: 'Transport', date: '2026-10-12' });
  await page.reload();
  const row = rowOf(page, 'Transport');
  await expect(row.getByTestId('category-remaining')).toHaveText('-€5.00');
  await expect(row.getByTestId('category-usage')).toHaveText('–');
  await expectOverBudget(page, 'Transport');
  expect(errors).toEqual([]);
});

test('AC5: after a reload Eating out is still over budget with remaining -€30.00', async ({ page }) => {
  const errors = await start(page);
  await eatingOutOverBudget(page);
  await expectOverBudget(page, 'Eating out');
  await page.reload();
  await expectOverBudget(page, 'Eating out');
  await expect(rowOf(page, 'Eating out').getByTestId('category-remaining')).toHaveText('-€30.00');
  expect(errors).toEqual([]);
});
