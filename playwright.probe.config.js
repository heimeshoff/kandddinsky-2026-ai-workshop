// @ts-check
// Config for the tester agent's throwaway probes in .tester/ (git-ignored). Run: npm run probe
const base = require('./playwright.config.js');

module.exports = { ...base, testDir: './.tester' };
