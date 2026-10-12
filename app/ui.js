// UI wiring: renders domain state into the DOM. No business rules here.
(function () {
  'use strict';
  const STORAGE_KEY = 'budget-app-v1';

  function load() {
    let state;
    try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { state = {}; }
    if (!Array.isArray(state.categories)) state.categories = [];
    if (!Array.isArray(state.expenses)) state.expenses = [];
    return state;
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: state.categories, expenses: state.expenses }));
  }

  const byTestId = (id) => document.querySelector(`[data-testid="${id}"]`);

  function cell(testid, text, className) {
    const td = document.createElement('td');
    td.dataset.testid = testid;
    if (className) td.className = className;
    td.textContent = text;
    return td;
  }

  function renderCategories(state) {
    const { categories, expenses, shownMonth } = state;
    byTestId('category-list').replaceChildren(...categories.map((category) => {
      const row = document.createElement('tr');
      row.dataset.testid = 'category-row';
      row.dataset.categoryId = category.id;
      const { spent, remaining, usage } = Budget.categoryInMonth(category, expenses, shownMonth);
      row.append(
        cell('category-name', category.name),
        cell('category-budgeted', Budget.formatEuro(category.budgeted), 'amount'),
        cell('category-spent', Budget.formatEuro(spent), 'amount'),
        cell('category-remaining', Budget.formatEuro(remaining), 'amount'),
        cell('category-usage', Budget.formatUsage(usage), 'amount'),
      );
      return row;
    }));
    const empty = categories.length === 0;
    byTestId('category-empty').hidden = !empty;
    byTestId('category-table').hidden = empty;
  }

  function renderCategorySelect(categories) {
    const select = byTestId('expense-category-select');
    const previous = select.value;
    select.replaceChildren(...categories.map((category) => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      return option;
    }));
    // keep the user's choice; otherwise the first category is preselected
    if (categories.some((c) => c.id === previous)) select.value = previous;
    // without categories no expense can be recorded: disable the form and say why
    const noCategories = categories.length === 0;
    select.disabled = noCategories;
    byTestId('expense-add-button').disabled = noCategories;
    byTestId('expense-hint').hidden = !noCategories;
  }

  function renderExpenses(state) {
    const names = new Map(state.categories.map((c) => [c.id, c.name]));
    const shown = Budget.expensesInMonth(state.expenses, state.shownMonth);
    byTestId('expense-list').replaceChildren(...shown.map((expense) => {
      const row = document.createElement('tr');
      row.dataset.testid = 'expense-row';
      row.dataset.expenseId = expense.id;
      row.append(
        cell('expense-date', expense.date),
        cell('expense-category', names.get(expense.categoryId) || ''),
        cell('expense-amount', Budget.formatEuro(expense.amount), 'amount'),
        cell('expense-note', expense.note || ''),
      );
      return row;
    }));
    const empty = shown.length === 0;
    byTestId('expense-empty').hidden = !empty;
    byTestId('expense-table').hidden = empty;
  }

  function showError(testid, message) {
    const error = byTestId(testid);
    error.textContent = message || '';
    error.hidden = !message;
  }

  function render(state) {
    byTestId('app-title').textContent = Budget.APP_NAME;
    byTestId('shown-month').textContent = Budget.formatMonth(state.shownMonth);
    renderCategories(state);
    renderCategorySelect(state.categories);
    renderExpenses(state);
  }

  const state = load();
  const today = Budget.toIsoDate(new Date());
  // The app always shows one month; for now the current one (switching comes later).
  state.shownMonth = Budget.monthOf(today);
  byTestId('expense-date-input').value = today;

  byTestId('category-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = byTestId('category-name-input');
    const budgetInput = byTestId('category-budget-input');
    const result = Budget.addCategoryFromInput(state.categories, nameInput.value, budgetInput.value);
    showError('category-error', result.error);
    if (result.error) return; // keep the input so the user can correct it
    state.categories = result.categories;
    save(state);
    render(state);
    nameInput.value = '';
    budgetInput.value = '';
    nameInput.focus();
  });

  byTestId('expense-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const amountInput = byTestId('expense-amount-input');
    const noteInput = byTestId('expense-note-input');
    const result = Budget.addExpenseFromInput(state.expenses, state.categories, {
      amountText: amountInput.value,
      categoryId: byTestId('expense-category-select').value,
      date: byTestId('expense-date-input').value,
      note: noteInput.value,
    });
    showError('expense-error', result.error);
    if (result.error) return; // keep the input so the user can correct it
    state.expenses = result.expenses;
    save(state);
    render(state);
    // amount and note are cleared; category and date keep their values
    amountInput.value = '';
    noteInput.value = '';
    amountInput.focus();
  });

  render(state);
  save(state);
})();
