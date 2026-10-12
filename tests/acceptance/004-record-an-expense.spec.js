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
}

async function addExpense(page, { amount, category, date, note }) {
  await page.getByTestId('expense-amount-input').fill(amount);
  if (category) await page.getByTestId('expense-category-select').selectOption({ label: category });
  if (date) await page.getByTestId('expense-date-input').fill(date);
  if (note !== undefined) await page.getByTestId('expense-note-input').fill(note);
  await page.getByTestId('expense-add-button').click();
}

function spentOf(page, name) {
  return page.getByTestId('category-row')
    .filter({ has: page.getByTestId('category-name').getByText(name, { exact: true }) })
    .getByTestId('category-spent');
}

test('AC1: with empty storage the app shows October 2026, today as expense date and "No expenses this month"', async ({ page }) => {
  const errors = await start(page);
  await expect(page.getByTestId('shown-month')).toHaveText('October 2026');
  await expect(page.getByTestId('expense-date-input')).toHaveValue('2026-10-12');
  await expect(page.getByTestId('expense-empty')).toBeVisible();
  await expect(page.getByTestId('expense-empty')).toHaveText('No expenses this month');
  await expect(page.getByTestId('expense-row')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('AC2: recording 45.50 for Groceries with a note shows one expense-row and adds to category-spent', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Groceries', '300');
  await addExpense(page, { amount: '45.50', category: 'Groceries', note: 'Weekly shop' });
  const rows = page.getByTestId('expense-row');
  await expect(rows).toHaveCount(1);
  await expect(rows.first().getByTestId('expense-date')).toHaveText('2026-10-12');
  await expect(rows.first().getByTestId('expense-category')).toHaveText('Groceries');
  await expect(rows.first().getByTestId('expense-amount')).toHaveText('€45.50');
  await expect(rows.first().getByTestId('expense-note')).toHaveText('Weekly shop');
  await expect(page.getByTestId('expense-empty')).toBeHidden();
  await expect(spentOf(page, 'Groceries')).toHaveText('€45.50');
  // after a successful add: amount and note cleared, category and date kept
  await expect(page.getByTestId('expense-amount-input')).toHaveValue('');
  await expect(page.getByTestId('expense-note-input')).toHaveValue('');
  await expect(page.getByTestId('expense-date-input')).toHaveValue('2026-10-12');
  expect(errors).toEqual([]);
});

test('AC3: two expenses are listed newest date first and summed per category', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Groceries', '300');
  await addCategory(page, 'Transport', '80');
  const select = page.getByTestId('expense-category-select');
  await expect(select.locator('option')).toHaveText(['Groceries', 'Transport']);
  await expect(select.locator('option:checked')).toHaveText('Groceries');
  await addExpense(page, { amount: '45.50', category: 'Groceries' });
  await addExpense(page, { amount: '12.30', category: 'Groceries', date: '2026-10-03' });
  const rows = page.getByTestId('expense-row');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0).getByTestId('expense-date')).toHaveText('2026-10-12');
  await expect(rows.nth(0).getByTestId('expense-amount')).toHaveText('€45.50');
  await expect(rows.nth(0).getByTestId('expense-note')).toHaveText('');
  await expect(rows.nth(1).getByTestId('expense-date')).toHaveText('2026-10-03');
  await expect(rows.nth(1).getByTestId('expense-amount')).toHaveText('€12.30');
  await expect(spentOf(page, 'Groceries')).toHaveText('€57.80');
  await expect(spentOf(page, 'Transport')).toHaveText('€0.00');
  expect(errors).toEqual([]);
});

test('AC4: expenses dated in another month are neither listed nor counted', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Groceries', '300');
  await addExpense(page, { amount: '20.00', category: 'Groceries', date: '2026-09-30' });
  await addExpense(page, { amount: '10.00', category: 'Groceries', date: '2026-11-01' });
  await expect(page.getByTestId('expense-row')).toHaveCount(0);
  await expect(page.getByTestId('expense-empty')).toBeVisible();
  await expect(spentOf(page, 'Groceries')).toHaveText('€0.00');
  // they are recorded nevertheless (visible once month switching exists)
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('budget-app-v1')).expenses.map((e) => e.date));
  expect(stored.sort()).toEqual(['2026-09-30', '2026-11-01']);
  expect(errors).toEqual([]);
});

test('AC5: expenses survive a page reload and only the shown month is listed', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Groceries', '300');
  await addExpense(page, { amount: '45.50', category: 'Groceries', note: 'Weekly shop' });
  await addExpense(page, { amount: '20.00', category: 'Groceries', date: '2026-09-30', note: '' });
  await expect(page.getByTestId('expense-row')).toHaveCount(1);
  await page.reload();
  const rows = page.getByTestId('expense-row');
  await expect(rows).toHaveCount(1);
  await expect(rows.first().getByTestId('expense-date')).toHaveText('2026-10-12');
  await expect(rows.first().getByTestId('expense-amount')).toHaveText('€45.50');
  await expect(rows.first().getByTestId('expense-note')).toHaveText('Weekly shop');
  await expect(spentOf(page, 'Groceries')).toHaveText('€45.50');
  expect(errors).toEqual([]);
});
