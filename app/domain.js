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

  // ---- Months and dates ---------------------------------------------------
  // A date is "YYYY-MM-DD", a month is "YYYY-MM" (both compare correctly as strings).

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  /** True when text is a real calendar date "YYYY-MM-DD". */
  function isIsoDate(text) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof text === 'string' ? text : '');
    if (!m) return false;
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const date = new Date(Date.UTC(y, mo - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
  }

  /** The local calendar date of a JS Date as "YYYY-MM-DD". */
  function toIsoDate(date) {
    const y = String(date.getFullYear()).padStart(4, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** The month ("YYYY-MM") a date ("YYYY-MM-DD") belongs to. */
  function monthOf(date) {
    return String(date).slice(0, 7);
  }

  /** "2026-10" -> "October 2026". */
  function formatMonth(month) {
    const [y, m] = String(month).split('-');
    return `${MONTH_NAMES[Number(m) - 1]} ${Number(y)}`;
  }

  // ---- Expenses -----------------------------------------------------------

  const EXPENSE_ERRORS = Object.freeze({
    amountInvalid: 'Amount must be a valid amount in euros greater than zero, e.g. 12.50',
    categoryUnknown: 'Choose an existing category',
    dateInvalid: 'Date must be a valid date',
  });

  /** Checks the expense rules. Returns an error text or null. */
  function validateExpense(categories, { amount, categoryId, date }) {
    if (!Number.isInteger(amount) || amount <= 0) return EXPENSE_ERRORS.amountInvalid;
    if (!categories.some((c) => c.id === categoryId)) return EXPENSE_ERRORS.categoryUnknown;
    if (!isIsoDate(date)) return EXPENSE_ERRORS.dateInvalid;
    return null;
  }

  function expenseSeq(expense) {
    const n = Number(String(expense.id).replace(/^e/, ''));
    return Number.isInteger(n) ? n : 0;
  }

  /**
   * Returns a new expense list with one expense appended. amount is integer cents (> 0),
   * categoryId references an existing category, date is "YYYY-MM-DD", note is optional.
   * Throws when the expense breaks a rule (see validateExpense).
   */
  function addExpense(expenses, categories, { amount, categoryId, date, note }) {
    const error = validateExpense(categories, { amount, categoryId, date });
    if (error) throw new Error(error);
    const seq = expenses.reduce((acc, e) => Math.max(acc, expenseSeq(e)), 0) + 1;
    const expense = { id: `e${seq}`, amount, categoryId, date, note: typeof note === 'string' ? note.trim() : '' };
    return [...expenses, expense];
  }

  /**
   * Adds an expense from what the user typed (amount as text).
   * Returns { expenses, error }: on rejection expenses is the unchanged list.
   */
  function addExpenseFromInput(expenses, categories, { amountText, categoryId, date, note }) {
    const input = { amount: parseAmount(amountText), categoryId, date, note };
    const error = validateExpense(categories, input);
    if (error) return { expenses, error };
    return { expenses: addExpense(expenses, categories, input), error: null };
  }

  /** The expenses of a month, newest date first; on the same date the most recently recorded first. */
  function expensesInMonth(expenses, month) {
    return expenses
      .filter((e) => monthOf(e.date) === month)
      .sort((a, b) => (a.date === b.date ? expenseSeq(b) - expenseSeq(a) : (a.date < b.date ? 1 : -1)));
  }

  /** Spent: the sum (integer cents) of a category's expenses in a month. */
  function spentInMonth(expenses, categoryId, month) {
    return expenses
      .filter((e) => e.categoryId === categoryId && monthOf(e.date) === month)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  return {
    APP_NAME, ERRORS, formatCents, formatEuro, parseAmount,
    findCategoryByName, validateCategory, addCategory, addCategoryFromInput,
    EXPENSE_ERRORS, isIsoDate, toIsoDate, monthOf, formatMonth,
    validateExpense, addExpense, addExpenseFromInput, expensesInMonth, spentInMonth,
  };
});
