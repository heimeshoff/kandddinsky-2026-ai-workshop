// Live task board: node board/server.js  →  http://localhost:4321
import { createServer } from 'node:http';
import { readFileSync, watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readBoard, promote } from './board.js';

const here = dirname(fileURLToPath(import.meta.url));
const tasksDir = join(here, '..', 'tasks');
const port = Number(process.env.PORT ?? 4321);
const clients = new Set();

const snapshot = () => `data: ${JSON.stringify(readBoard(tasksDir))}\n\n`;

let pending;
watch(tasksDir, { recursive: true }, () => {
  clearTimeout(pending);
  pending = setTimeout(() => { const s = snapshot(); for (const c of clients) c.write(s); }, 100);
});

createServer((req, res) => {
  if (req.url === '/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(snapshot());
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  if (req.method === 'POST' && req.url.startsWith('/promote/')) {
    try {
      const target = promote(tasksDir, decodeURIComponent(req.url.slice('/promote/'.length)));
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: true, file: target }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(readFileSync(join(here, 'index.html')));
    return;
  }
  res.writeHead(404).end();
}).listen(port, () => console.log(`Task board on http://localhost:${port}`));
