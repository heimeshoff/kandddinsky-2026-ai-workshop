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

  /** Formats integer cents as euros, e.g. 30000 -> "€300.00", -2000 -> "-€20.00". */
  function formatEuro(cents) {
    const text = formatCents(cents);
    return text.startsWith('-') ? `-€${text.slice(1)}` : `€${text}`;
  }

  /**
   * Parses user input like "300", "120.50" or "12,5" into integer cents (string-based, exact).
   * Accepts "." or "," as decimal separator, at most 2 decimals, an optional leading "-".
   * Returns null when the input is not an amount.
   */
  function parseAmount(input) {
    if (typeof input !== 'string') return null;
    const m = /^(-?)(\d+)(?:[.,](\d{1,2}))?$/.exec(input.trim());
    if (!m) return null;
    const cents = Number(m[2]) * 100 + Number((m[3] || '').padEnd(2, '0'));
    return m[1] === '-' && cents !== 0 ? -cents : cents;
  }

  /** Next free category id ("c1", "c2", …), never reusing an id already in the list. */
  function nextCategoryId(categories) {
    const max = categories.reduce((acc, c) => {
      const n = Number(String(c.id).replace(/^c/, ''));
      return Number.isInteger(n) && n > acc ? n : acc;
    }, 0);
    return `c${max + 1}`;
  }

  /** Error texts shown to the user when a category is rejected. */
  const ERRORS = Object.freeze({
    nameEmpty: 'Category name must not be empty',
    nameTaken: (existingName) => `A category named "${existingName}" already exists`,
    budgetNegative: 'Budgeted amount must be zero or more',
    budgetInvalid: 'Budgeted amount must be a valid amount in euros, e.g. 300 or 12.50',
  });

  /** Finds a category by name, ignoring upper/lower case and surrounding spaces. */
  function findCategoryByName(categories, name) {
    const key = String(name).trim().toLowerCase();
    return categories.find((c) => c.name.trim().toLowerCase() === key) || null;
  }

  /**
   * Checks the category rules: name not empty, name unique (ignoring case),
   * budgeted amount integer cents and zero or more. Returns an error text or null.
   */
  function validateCategory(categories, name, budgeted) {
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (trimmed === '') return ERRORS.nameEmpty;
    const existing = findCategoryByName(categories, trimmed);
    if (existing) return ERRORS.nameTaken(existing.name);
    if (!Number.isInteger(budgeted)) return ERRORS.budgetInvalid;
    if (budgeted < 0) return ERRORS.budgetNegative;
    return null;
  }

  /**
   * Returns a new category list with a category appended (creation order).
   * The name is trimmed; budgeted is the budgeted amount in integer cents.
   * Throws when the category breaks a rule (see validateCategory).
   */
  function addCategory(categories, name, budgeted) {
    const error = validateCategory(categories, name, budgeted);
    if (error) throw new Error(error);
    const category = { id: nextCategoryId(categories), name: name.trim(), budgeted };
    return [...categories, category];
  }

  /**
   * Adds a category from what the user typed (amount as text, e.g. "300" or "12,50").
   * Returns { categories, error }: on success error is null; on rejection categories is the unchanged list.
   */
  function addCategoryFromInput(categories, name, amountText) {
    const error = validateCategory(categories, name, parseAmount(amountText));
    if (error) return { categories, error };
    return { categories: addCategory(categories, name, parseAmount(amountText)), error: null };
  }

  return {
    APP_NAME, ERRORS, formatCents, formatEuro, parseAmount,
    findCategoryByName, validateCategory, addCategory, addCategoryFromInput,
  };
});
