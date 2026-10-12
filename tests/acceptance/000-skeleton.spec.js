const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

test('AC1: the app opens from disk and shows its title without errors', async ({ page }) => {
  const errors = await openApp(page);
  await expect(page.getByTestId('app-title')).toHaveText('Budget');
  expect(errors).toEqual([]);
});
