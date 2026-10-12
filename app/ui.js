// UI wiring: renders domain state into the DOM. No business rules here.
(function () {
  'use strict';
  const STORAGE_KEY = 'budget-app-v1';

  function load() {
    let state;
    try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { state = {}; }
    if (!Array.isArray(state.categories)) state.categories = [];
    return state;
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const byTestId = (id) => document.querySelector(`[data-testid="${id}"]`);

  function renderCategories(categories) {
    const list = byTestId('category-list');
    list.replaceChildren(...categories.map((category) => {
      const row = document.createElement('tr');
      row.dataset.testid = 'category-row';
      row.dataset.categoryId = category.id;

      const name = document.createElement('td');
      name.dataset.testid = 'category-name';
      name.textContent = category.name;

      const budgeted = document.createElement('td');
      budgeted.dataset.testid = 'category-budgeted';
      budgeted.className = 'amount';
      budgeted.textContent = Budget.formatEuro(category.budgeted);

      row.append(name, budgeted);
      return row;
    }));
    const empty = categories.length === 0;
    byTestId('category-empty').hidden = !empty;
    byTestId('category-table').hidden = empty;
  }

  function showCategoryError(message) {
    const error = byTestId('category-error');
    error.textContent = message || '';
    error.hidden = !message;
  }

  function render(state) {
    byTestId('app-title').textContent = Budget.APP_NAME;
    renderCategories(state.categories);
  }

  const state = load();

  byTestId('category-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = byTestId('category-name-input');
    const budgetInput = byTestId('category-budget-input');
    const result = Budget.addCategoryFromInput(state.categories, nameInput.value, budgetInput.value);
    showCategoryError(result.error);
    if (result.error) return; // keep the input so the user can correct it
    state.categories = result.categories;
    save(state);
    render(state);
    nameInput.value = '';
    budgetInput.value = '';
    nameInput.focus();
  });

  render(state);
  save(state);
})();
