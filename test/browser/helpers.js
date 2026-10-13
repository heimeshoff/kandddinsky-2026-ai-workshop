import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('../../', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript' };
export const TODAY = new Date('2026-10-13T12:00:00');

// Serves the app over http (ES modules do not load from file://).
// `breakScript` serves index.html with a wrong <script> path, to prove the smoke test catches it.
export async function startApp({ breakScript = false } = {}) {
  const server = createServer(async (req, res) => {
    try {
      const path = req.url === '/' ? '/index.html' : req.url.split('?')[0];
      const file = join(root, normalize(path));
      if (!file.startsWith(root)) throw new Error('outside');
      let body = await readFile(file);
      if (breakScript && path === '/index.html') body = Buffer.from(String(body).replace('src/app.js', 'src/missing.js'));
      res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() };
}

// Fresh browser context = empty stored data every run; "today" fixed to 2026-10-13.
export async function openPage(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
  await context.clock.setFixedTime(TODAY);
  await page.goto(url);
  return { page, errors, close: () => browser.close() };
}
