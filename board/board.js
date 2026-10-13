import { readdirSync, readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const STATES = ['backlog', 'todo', 'doing', 'done'];

export function parseTask(fileName, text) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const meta = {};
  if (fm) for (const line of fm[1].split(/\r?\n/)) {
    const m = /^(\w+):\s*(.*)$/.exec(line);
    if (m) meta[m[1]] = m[2].trim();
  }
  const num = /^(\d+)-/.exec(fileName);
  return {
    file: fileName,
    id: meta.id ?? (num ? num[1] : null),
    title: meta.title ?? fileName.replace(/\.md$/, ''),
    dependsOn: (meta.depends_on ?? '').replace(/[[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean),
    blocked: meta.blocked ?? null,
    source: meta.source ?? null,
    body: fm ? text.slice(fm[0].length).trim() : text.trim(),
  };
}

export function nextNumber(fileNames) {
  const nums = fileNames.map(f => /^(\d+)-/.exec(f)).filter(Boolean).map(m => Number(m[1]));
  return String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
}

// Backlog frontmatter (title, source) becomes task frontmatter (id, title, depends_on).
export function promotedContent(id, text) {
  const task = parseTask('', text);
  return `---\nid: ${id}\ntitle: ${task.title}\ndepends_on: []\n---\n\n${task.body}\n`;
}

const mdFiles = dir => existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.md')) : [];

export function readBoard(tasksDir) {
  const board = {};
  for (const state of STATES) {
    const files = mdFiles(join(tasksDir, state));
    board[state] = files.filter(f => !f.endsWith('.log.md')).map(f => ({
      ...parseTask(f, readFileSync(join(tasksDir, state, f), 'utf8')),
      hasLog: files.includes(f.replace(/\.md$/, '.log.md')),
    }));
  }
  return board;
}

export function promote(tasksDir, backlogFile) {
  if (!/^[\w.-]+\.md$/.test(backlogFile)) throw new Error('invalid file name');
  const from = join(tasksDir, 'backlog', backlogFile);
  if (!existsSync(from)) throw new Error(`${backlogFile} is not in backlog`);
  const id = nextNumber(['todo', 'doing', 'done'].flatMap(s => mdFiles(join(tasksDir, s))));
  const target = `${id}-${backlogFile}`;
  const to = join(tasksDir, 'todo', target);
  writeFileSync(from, promotedContent(id, readFileSync(from, 'utf8')));
  renameSync(from, to);
  return target;
}
