const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

const INVALID_AMOUNT = 'Budgeted amount must be a valid amount in euros, e.g. 300 or 12.50';

async function addCategory(page, name, budget) {
  await page.getByTestId('category-name-input').fill(name);
  await page.getByTestId('category-budget-input').fill(budget);
  await page.getByTestId('category-add-button').click();
}

async function expectRows(page, expected) {
  const rows = page.getByTestId('category-row');
  await expect(rows).toHaveCount(expected.length);
  for (let i = 0; i < expected.length; i++) {
    await expect(rows.nth(i).getByTestId('category-name')).toHaveText(expected[i][0]);
    await expect(rows.nth(i).getByTestId('category-budgeted')).toHaveText(expected[i][1]);
  }
}

test('AC1: an empty or blank category name is rejected with "Category name must not be empty"', async ({ page }) => {
  const errors = await openApp(page);
  for (const name of ['', '   ']) {
    await addCategory(page, name, '100');
    await expect(page.getByTestId('category-row')).toHaveCount(0);
    await expect(page.getByTestId('category-error')).toBeVisible();
    await expect(page.getByTestId('category-error')).toHaveText('Category name must not be empty');
    await expect(page.getByTestId('category-budget-input')).toHaveValue('100');
  }
  expect(errors).toEqual([]);
});

test('AC2: a name that already exists ignoring case is rejected naming the stored category', async ({ page }) => {
  const errors = await openApp(page);
  await addCategory(page, 'Groceries', '300');
  for (const name of ['groceries', ' GROCERIES ']) {
    await addCategory(page, name, '50');
    await expectRows(page, [['Groceries', '€300.00']]);
    await expect(page.getByTestId('category-error')).toBeVisible();
    await expect(page.getByTestId('category-error')).toHaveText('A category named "Groceries" already exists');
    await expect(page.getByTestId('category-name-input')).toHaveValue(name);
  }
  expect(errors).toEqual([]);
});

test('AC3: a negative budgeted amount is rejected with "Budgeted amount must be zero or more"', async ({ page }) => {
  const errors = await openApp(page);
  await addCategory(page, 'Groceries', '-10');
  await expect(page.getByTestId('category-row')).toHaveCount(0);
  await expect(page.getByTestId('category-error')).toBeVisible();
  await expect(page.getByTestId('category-error')).toHaveText('Budgeted amount must be zero or more');
  await expect(page.getByTestId('category-budget-input')).toHaveValue('-10');
  expect(errors).toEqual([]);
});

test('AC4: an empty, non-numeric or too precise budgeted amount is rejected as not a valid amount', async ({ page }) => {
  const errors = await openApp(page);
  for (const amount of ['', 'abc', '12.345']) {
    await addCategory(page, 'Groceries', amount);
    await expect(page.getByTestId('category-row')).toHaveCount(0);
    await expect(page.getByTestId('category-error')).toBeVisible();
    await expect(page.getByTestId('category-error')).toHaveText(INVALID_AMOUNT);
    await expect(page.getByTestId('category-name-input')).toHaveValue('Groceries');
  }
  expect(errors).toEqual([]);
});

test('AC5: after a rejected attempt a valid category clears the error, is shown and survives a reload', async ({ page }) => {
  const errors = await openApp(page);
  await addCategory(page, 'Groceries', 'abc');
  await expect(page.getByTestId('category-error')).toHaveText(INVALID_AMOUNT);
  await addCategory(page, 'Groceries', '300');
  await expect(page.getByTestId('category-error')).toBeHidden();
  await expectRows(page, [['Groceries', '€300.00']]);
  await page.reload();
  await expectRows(page, [['Groceries', '€300.00']]);
  expect(errors).toEqual([]);
});
