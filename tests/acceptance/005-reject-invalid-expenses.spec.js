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

async function addExpense(page, amount) {
  await page.getByTestId('expense-amount-input').fill(amount);
  await page.getByTestId('expense-category-select').selectOption({ label: 'Groceries' });
  await page.getByTestId('expense-add-button').click();
}

function spentOf(page, name) {
  return page.getByTestId('category-row')
    .filter({ has: page.getByTestId('category-name').getByText(name, { exact: true }) })
    .getByTestId('category-spent');
}

async function storedExpenses(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('budget-app-v1')).expenses);
}

test('AC1: an amount of "0" or "-5" is rejected with "Expense amount must be greater than zero"', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Groceries', '300');
  for (const amount of ['0', '-5']) {
    await addExpense(page, amount);
    await expect(page.getByTestId('expense-error')).toBeVisible();
    await expect(page.getByTestId('expense-error')).toHaveText('Expense amount must be greater than zero');
    await expect(page.getByTestId('expense-row')).toHaveCount(0);
    await expect(spentOf(page, 'Groceries')).toHaveText('€0.00');
    // the input is kept so the user can correct it
    await expect(page.getByTestId('expense-amount-input')).toHaveValue(amount);
  }
  expect(await storedExpenses(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('AC2: an empty, non-numeric or over-precise amount is rejected as not a valid amount in euros', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Groceries', '300');
  for (const amount of ['', 'abc', '4.999']) {
    await addExpense(page, amount);
    await expect(page.getByTestId('expense-error')).toBeVisible();
    await expect(page.getByTestId('expense-error'))
      .toHaveText('Expense amount must be a valid amount in euros, e.g. 12.50');
    await expect(page.getByTestId('expense-row')).toHaveCount(0);
    await expect(page.getByTestId('expense-amount-input')).toHaveValue(amount);
  }
  expect(await storedExpenses(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('AC3: an expense without a date is rejected with "Please choose a date"', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Groceries', '300');
  await page.getByTestId('expense-date-input').fill('');
  await addExpense(page, '10');
  await expect(page.getByTestId('expense-error')).toBeVisible();
  await expect(page.getByTestId('expense-error')).toHaveText('Please choose a date');
  await expect(page.getByTestId('expense-row')).toHaveCount(0);
  await expect(page.getByTestId('expense-amount-input')).toHaveValue('10');
  await expect(spentOf(page, 'Groceries')).toHaveText('€0.00');
  expect(await storedExpenses(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('AC4: without categories the expense form is disabled with a hint; adding a category enables it', async ({ page }) => {
  const errors = await start(page);
  await expect(page.getByTestId('expense-add-button')).toBeDisabled();
  await expect(page.getByTestId('expense-hint')).toBeVisible();
  await expect(page.getByTestId('expense-hint')).toHaveText('Add a category first to record expenses');
  await addCategory(page, 'Groceries', '300');
  await expect(page.getByTestId('expense-add-button')).toBeEnabled();
  await expect(page.getByTestId('expense-hint')).toBeHidden();
  await expect(page.getByTestId('expense-category-select').locator('option:checked')).toHaveText('Groceries');
  expect(errors).toEqual([]);
});

test('AC5: after a rejected attempt a valid expense clears the error and is the only one stored after reload', async ({ page }) => {
  const errors = await start(page);
  await addCategory(page, 'Groceries', '300');
  await addExpense(page, '0');
  await expect(page.getByTestId('expense-error')).toBeVisible();
  await addExpense(page, '10');
  await expect(page.getByTestId('expense-error')).toBeHidden();
  const rows = page.getByTestId('expense-row');
  await expect(rows).toHaveCount(1);
  await expect(rows.first().getByTestId('expense-amount')).toHaveText('€10.00');
  await expect(rows.first().getByTestId('expense-category')).toHaveText('Groceries');
  await expect(rows.first().getByTestId('expense-date')).toHaveText('2026-10-12');
  await page.reload();
  await expect(page.getByTestId('expense-row')).toHaveCount(1);
  await expect(page.getByTestId('expense-row').first().getByTestId('expense-amount')).toHaveText('€10.00');
  await expect(page.getByTestId('expense-error')).toBeHidden();
  const stored = await storedExpenses(page);
  expect(stored).toHaveLength(1);
  expect(stored[0]).toMatchObject({ amount: 1000, date: '2026-10-12' });
  expect(errors).toEqual([]);
});
