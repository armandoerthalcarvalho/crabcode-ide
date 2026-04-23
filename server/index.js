// CrabCode Cloud API Server
// Provides simple key-value persistence for salve/carregue nuvem commands.
// Deploy to render.com (see render.yaml) or run locally: node index.js

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== SECURITY ====================
// CORS: allow all origins (CrabCode is a static site hosted anywhere)
app.use(cors());
app.use(express.json({ limit: '64kb' }));

// ==================== DATABASE ====================
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS kv (
    cloud_key TEXT NOT NULL,
    data      TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (cloud_key)
  );
`);

const stmtGet    = db.prepare('SELECT data FROM kv WHERE cloud_key = ?');
const stmtUpsert = db.prepare(`
  INSERT INTO kv (cloud_key, data, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(cloud_key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
`);

// ==================== ROUTES ====================

// GET /load/:key — retrieve stored JSON object
app.get('/load/:key', (req, res) => {
  const key = req.params.key;
  if (!isValidKey(key)) return res.status(400).json({ error: 'chave inválida' });
  const row = stmtGet.get(key);
  if (!row) return res.json({});
  try {
    res.json(JSON.parse(row.data));
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
  stmtUpsert.run(key, JSON.stringify(body), Date.now());
  res.json({ ok: true });
});

// ==================== VALIDATION ====================
function isValidKey(key) {
  return typeof key === 'string' && /^[a-zA-Z0-9_\-]{1,64}$/.test(key);
}

// ==================== START ====================
app.listen(PORT, () => {
  console.log(`CrabCode API running on port ${PORT}`);
});
