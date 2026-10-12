// UI wiring: renders domain state into the DOM. No business rules here.
(function () {
  'use strict';
  const STORAGE_KEY = 'budget-app-v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function render(state) {
    document.querySelector('[data-testid="app-title"]').textContent = Budget.APP_NAME;
  }

  const state = load();
  render(state);
  save(state);
})();
