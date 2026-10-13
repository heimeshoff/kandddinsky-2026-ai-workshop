import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, openPage } from './helpers.js';

test('overspending a budget shows the warning box', async () => {
  const app = await startApp();
  const { page, errors, close } = await openPage(app.url);
  try {
    await page.fill('#category-input', 'Food');
    await page.click('#category-form button[type=submit]');
    assert.equal(await page.locator('#budget-warning').isVisible(), false, 'no warning without budget');

    await page.fill('[aria-label="Budget for Food"]', '50.00');
    await page.click('#category-list button:has-text("Set budget")');
    await page.waitForFunction(() => /Budget: 50\.00 €/.test(document.querySelector('#category-list').textContent), null, { timeout: 3000 });
    assert.equal(await page.locator('#budget-warning').isVisible(), false, 'no warning before spending');

    await page.fill('#expense-amount', '60.00');
    await page.selectOption('#expense-category', 'Food');
    await page.fill('#expense-date', '2026-10-05');
    await page.click('#expense-submit');
    await page.waitForSelector('#budget-warning:not([hidden])', { timeout: 3000 });
    assert.match(await page.locator('#budget-warning').innerText(), /Food: spent 60\.00 € of 50\.00 €/);

    await page.reload();
    await page.waitForSelector('#budget-warning:not([hidden])', { timeout: 3000 });
    assert.deepEqual(errors, []);
  } finally {
    await close();
    app.close();
  }
});
