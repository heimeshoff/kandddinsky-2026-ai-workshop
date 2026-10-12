const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers');

const GREEN = 'rgb(46, 125, 50)';
const WHITE = 'rgb(255, 255, 255)';

/** Injects an element into `parentSelector` and returns its computed colours. */
async function inject(page, { tag = 'button', type, text = 'Save', testid, parentSelector = 'main' }) {
  await page.evaluate(({ tag, type, text, testid, parentSelector }) => {
    const el = document.createElement(tag);
    if (type) { el.type = type; el.value = text; } else { el.textContent = text; }
    el.setAttribute('data-testid', testid);
    document.querySelector(parentSelector).appendChild(el);
  }, { tag, type, text, testid, parentSelector });
  const el = page.getByTestId(testid);
  await expect(el).toBeVisible();
  return el.evaluate((node) => {
    const cs = getComputedStyle(node);
    return { bg: cs.backgroundColor, color: cs.color };
  });
}

function parseRgb(s) {
  return s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
}

function luminance([r, g, b]) {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(parseRgb(a)), luminance(parseRgb(b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test('AC1: a plain "Save" button is green with white text', async ({ page }) => {
  const errors = await openApp(page);
  const s = await inject(page, { testid: 'probe-save' });
  expect(s.bg).toBe(GREEN);
  expect(s.color).toBe(WHITE);
  expect(errors).toEqual([]);
});

test('AC2: submit, button and reset inputs are green with white text', async ({ page }) => {
  const errors = await openApp(page);
  for (const type of ['submit', 'button', 'reset']) {
    const s = await inject(page, { tag: 'input', type, text: type, testid: `probe-${type}` });
    expect(s.bg, type).toBe(GREEN);
    expect(s.color, type).toBe(WHITE);
  }
  expect(errors).toEqual([]);
});

test('AC3: buttons stay green with white text in dark colour scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const errors = await openApp(page);
  const s = await inject(page, { testid: 'probe-dark' });
  expect(s.bg).toBe(GREEN);
  expect(s.color).toBe(WHITE);
  expect(errors).toEqual([]);
});

test('AC4: buttons in main and body are the same green with at least 4.5:1 contrast', async ({ page }) => {
  const errors = await openApp(page);
  const inMain = await inject(page, { testid: 'probe-main', parentSelector: 'main' });
  const inBody = await inject(page, { testid: 'probe-body', parentSelector: 'body' });
  expect(inMain.bg).toBe(GREEN);
  expect(inBody.bg).toBe(GREEN);
  expect(contrast(inMain.color, inMain.bg)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(inBody.color, inBody.bg)).toBeGreaterThanOrEqual(4.5);
  expect(errors).toEqual([]);
});

test('AC5: no console errors and one shared button selector in styles.css sets the green', async ({ page }) => {
  const errors = await openApp(page);
  const css = fs.readFileSync(path.resolve(__dirname, '../../app/styles.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const html = fs.readFileSync(path.resolve(__dirname, '../../app/index.html'), 'utf8');

  const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({
    selectors: m[1].split(',').map((s) => s.trim().replace(/'/g, '"')),
    body: m[2],
  }));
  const wanted = ['button', 'input[type="button"]', 'input[type="submit"]', 'input[type="reset"]'];
  const shared = rules.filter((r) => wanted.every((w) => r.selectors.includes(w)) && /background/.test(r.body));
  expect(shared).toHaveLength(1);
  expect(shared[0].body).toMatch(/background(-color)?\s*:\s*(var\(--button-bg\)|#2e7d32)/i);
  expect(css).toMatch(/--button-bg\s*:\s*#2e7d32/i);

  expect(html).not.toMatch(/style\s*=/i);
  expect(errors).toEqual([]);
});
