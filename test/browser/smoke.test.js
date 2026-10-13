import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, openPage } from './helpers.js';

const text = (page, sel) => page.locator(sel).innerText();
async function waitText(page, sel, expected) {
  await page.waitForFunction(([s, e]) => document.querySelector(s)?.textContent === e, [sel, expected], { timeout: 3000 });
}

async function walkCoreFlow(url) {
  const { page, errors, close } = await openPage(url);
  try {
    assert.deepEqual(errors, [], 'page loads without errors');
    await waitText(page, '#month', await text(page, '#month')); // month label present
    assert.match(await text(page, '#month'), /2026/);

    // Income 2,500.00 and Food 54.20 on 2026-10-05
    await page.fill('#income-input', '2500.00');
    await page.click('#income-form button[type=submit]');
    await waitText(page, '#income', '2,500.00 €');
    await page.fill('#category-input', 'Food');
    await page.click('#category-form button[type=submit]');
    await page.fill('#expense-amount', '54.20');
    await page.selectOption('#expense-category', 'Food');
    await page.fill('#expense-date', '2026-10-05');
    await page.click('#expense-submit');
    await waitText(page, '#spent', '54.20 €');
    assert.match(await text(page, '#category-list'), /Food: 54\.20 €/);
    assert.equal(await text(page, '#balance'), '2,445.80 €');

    // Reload: data persists
    await page.reload();
    await waitText(page, '#income', '2,500.00 €');
    assert.match(await text(page, '#category-list'), /Food: 54\.20 €/);
    assert.match(await text(page, '#expense-list'), /54\.20 € Food 2026-10-05/);

    // November: carry-over income, nothing spent
    await page.click('#next-month');
    await waitText(page, '#income', '2,500.00 €');
    assert.match(await text(page, '#category-list'), /Food: 0\.00 €/);
    await page.click('#prev-month');
    await waitText(page, '#spent', '54.20 €');

    // Edit to 60.00, then delete
    await page.click('#expense-list button:has-text("Edit")');
    await page.fill('[aria-label="Edit amount"]', '60.00');
    await page.click('#expense-list button:has-text("Save")');
    await waitText(page, '#spent', '60.00 €');
    assert.match(await text(page, '#category-list'), /Food: 60\.00 €/);
    await page.click('#expense-list button:has-text("Delete")');
    await waitText(page, '#spent', '0.00 €');
    assert.match(await text(page, '#category-list'), /Food: 0\.00 €/);
    assert.deepEqual(errors, [], 'no page errors during the flow');
  } finally {
    await close();
  }
}

test('core flows work in a real browser', async () => {
  const app = await startApp();
  try { await walkCoreFlow(app.url); } finally { app.close(); }
});

test('a broken page script fails the smoke flow', async () => {
  const app = await startApp({ breakScript: true });
  try { await assert.rejects(walkCoreFlow(app.url)); } finally { app.close(); }
});
