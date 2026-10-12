// Domain logic of the budgeting app. Pure: no DOM, no localStorage.
// Loads in the browser as window.Budget and in Node via require().
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Budget = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const APP_NAME = 'Budget';

  /** Formats integer cents as a currency string, e.g. 123456 -> "1,234.56". */
  function formatCents(cents) {
    if (!Number.isInteger(cents)) throw new TypeError('cents must be an integer');
    const sign = cents < 0 ? '-' : '';
    const abs = Math.abs(cents);
    const whole = Math.floor(abs / 100).toLocaleString('en-US');
    const frac = String(abs % 100).padStart(2, '0');
    return `${sign}${whole}.${frac}`;
  }

  return { APP_NAME, formatCents };
});
