// CrabCode Cloud API Server
// Provides simple key-value persistence for salve/carregue nuvem commands.
// Deploy to render.com (see render.yaml) or run locally: node index.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ==================== SECURITY ====================
// CORS: allow all origins (CrabCode is a static site hosted anywhere)
app.use(cors());
app.use(express.json({ limit: '64kb' }));

// ==================== DATABASE (IN-MEMORY MOCK) ====================
// MOCKED — in-memory store replacing native better-sqlite3
const kvStore = new Map();

// ==================== ROUTES ====================

// GET /load/:key — retrieve stored JSON object
app.get('/load/:key', (req, res) => {
  const key = req.params.key;
  if (!isValidKey(key)) return res.status(400).json({ error: 'chave inválida' });
  const raw = kvStore.get(key);
  if (!raw) return res.json({});
  try {
    res.json(JSON.parse(raw));
  } catch {
    res.json({});
  }
});

// POST /save/:key — store JSON object
app.post('/save/:key', (req, res) => {
  const key = req.params.key;
  if (!isValidKey(key)) return res.status(400).json({ error: 'chave inválida' });
  const body = req.body;
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'corpo inválido' });
  kvStore.set(key, JSON.stringify(body));
  res.json({ ok: true });
});

// ==================== VALIDATION ====================
function isValidKey(key) {
  return typeof key === 'string' && /^[a-zA-Z0-9_\-]{1,64}$/.test(key);
}

// ==================== START ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CrabCode API running on http://0.0.0.0:${PORT}`);
});
