import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseTask, nextNumber, readBoard, promote } from '../board/board.js';

const tasks = files => {
  const dir = mkdtempSync(join(tmpdir(), 'board-'));
  for (const s of ['backlog', 'todo', 'doing', 'done']) mkdirSync(join(dir, s));
  for (const [path, text] of Object.entries(files)) writeFileSync(join(dir, path), text);
  return dir;
};

test('parses task frontmatter', () => {
  const t = parseTask('007-x.md', '---\nid: 007\ntitle: Seven\ndepends_on: [005, 006]\n---\n\n## Goal\nG');
  assert.equal(t.id, '007');
  assert.equal(t.title, 'Seven');
  assert.deepEqual(t.dependsOn, ['005', '006']);
  assert.equal(t.body, '## Goal\nG');
});
test('backlog item has no id', () => assert.equal(parseTask('idea.md', '---\ntitle: Idea\nsource: modeling\n---\nx').id, null));
test('next number is max + 1, padded', () => assert.equal(nextNumber(['009-a.md', '017-b.md', '017-b.log.md']), '018'));
test('next number starts at 001', () => assert.equal(nextNumber([]), '001'));

test('board hides logs but marks tasks that have one', () => {
  const dir = tasks({ 'done/001-a.md': '---\nid: 001\ntitle: A\n---\n', 'done/001-a.log.md': 'log' });
  assert.deepEqual(readBoard(dir).done.map(t => [t.file, t.hasLog]), [['001-a.md', true]]);
});

test('promote moves backlog item to todo with the next number', () => {
  const dir = tasks({ 'backlog/idea.md': '---\ntitle: Idea\nsource: modeling\n---\n\nWhy.\n', 'done/004-x.md': '' });
  assert.equal(promote(dir, 'idea.md'), '005-idea.md');
  assert.equal(existsSync(join(dir, 'backlog/idea.md')), false);
  assert.equal(readFileSync(join(dir, 'todo/005-idea.md'), 'utf8'), '---\nid: 005\ntitle: Idea\ndepends_on: []\n---\n\nWhy.\n');
});
test('promote rejects unknown and unsafe names', () => {
  const dir = tasks({});
  assert.throws(() => promote(dir, 'nope.md'), /not in backlog/);
  assert.throws(() => promote(dir, '../todo/x.md'), /invalid/);
});
