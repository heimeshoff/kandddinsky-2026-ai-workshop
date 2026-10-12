const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

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

test('AC1: with empty storage no category-row is shown and category-empty says "No categories yet"', async ({ page }) => {
  const errors = await openApp(page);
  await expect(page.getByTestId('category-row')).toHaveCount(0);
  await expect(page.getByTestId('category-empty')).toBeVisible();
  await expect(page.getByTestId('category-empty')).toHaveText('No categories yet');
  expect(errors).toEqual([]);
});

test('AC2: adding "Groceries" with 300 shows one row with €300.00, hides empty state and clears inputs', async ({ page }) => {
  const errors = await openApp(page);
  await addCategory(page, 'Groceries', '300');
  await expectRows(page, [['Groceries', '€300.00']]);
  await expect(page.getByTestId('category-empty')).toBeHidden();
  await expect(page.getByTestId('category-name-input')).toHaveValue('');
  await expect(page.getByTestId('category-budget-input')).toHaveValue('');
  expect(errors).toEqual([]);
});

test('AC3: three categories are shown in creation order with their budgeted amounts', async ({ page }) => {
  const errors = await openApp(page);
  await addCategory(page, 'Groceries', '300');
  await addCategory(page, 'Eating out', '120.50');
  await addCategory(page, 'Transport', '0');
  await expectRows(page, [
    ['Groceries', '€300.00'],
    ['Eating out', '€120.50'],
    ['Transport', '€0.00'],
  ]);
  expect(errors).toEqual([]);
});

test('AC4: a comma decimal separator "12,5" is shown as €12.50', async ({ page }) => {
  const errors = await openApp(page);
  await addCategory(page, 'Groceries', '12,5');
  await expectRows(page, [['Groceries', '€12.50']]);
  expect(errors).toEqual([]);
});

test('AC5: categories survive a page reload in the same order', async ({ page }) => {
  const errors = await openApp(page);
  await addCategory(page, 'Groceries', '300');
  await addCategory(page, 'Eating out', '120.50');
  await expectRows(page, [['Groceries', '€300.00'], ['Eating out', '€120.50']]);
  await page.reload();
  await expectRows(page, [['Groceries', '€300.00'], ['Eating out', '€120.50']]);
  await expect(page.getByTestId('category-empty')).toBeHidden();
  expect(errors).toEqual([]);
});
