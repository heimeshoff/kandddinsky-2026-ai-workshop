const path = require('node:path');
const { pathToFileURL } = require('node:url');

const appUrl = pathToFileURL(path.resolve(__dirname, '../../app/index.html')).href;

/**
 * Opens app/index.html from disk and starts collecting console errors.
 * Returns the array of errors; assert it is empty at the end of a test.
 */
async function openApp(page) {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto(appUrl);
  return errors;
}

module.exports = { appUrl, openApp };
