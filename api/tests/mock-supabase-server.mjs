import http from 'node:http';
import fs from 'node:fs';

const port = Number(process.env.MOCK_PORT || '8787');
const status = Number(process.env.MOCK_STATUS || '201');
const logPath = process.env.MOCK_LOG || '/tmp/aaryx-blueprint-mock-supabase.log';
let storedRow = null;

function append(entry) {
  fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`);
}

const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');
  let body = null;
  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    body = rawBody;
  }

  append({ method: req.method, url: req.url, body });

  res.setHeader('content-type', 'application/json; charset=utf-8');

  if (req.method === 'GET') {
    res.statusCode = 200;
    res.end(JSON.stringify(storedRow ? [storedRow] : []));
    return;
  }

  if (status >= 400) {
    res.statusCode = status;
    res.end(JSON.stringify({ message: 'mock failure' }));
    return;
  }

  storedRow = body;
  res.statusCode = status;
  res.end(JSON.stringify([storedRow]));
});

server.listen(port, '127.0.0.1', () => {
  append({ event: 'listening', port, status });
  console.log(`mock-supabase listening on ${port} status ${status}`);
});
