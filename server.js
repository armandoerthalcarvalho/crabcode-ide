const express = require('express');
const cors = require('cors');
const path = require('path');

function isValidKey(key) {
  return typeof key === 'string' && /^[a-zA-Z0-9_\-]{1,64}$/.test(key);
}

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '64kb' }));

  // ==================== CLOUD KV ROUTES (DISABLED — NO CLOUD BACKEND) ====================
  const cloudUnavailable = (_req, res) => {
    res.status(501).json({
      error: 'Armazenamento em nuvem não está disponível neste ambiente. Utilize salve local / carregue local.'
    });
  };
  app.get('/load/:key', cloudUnavailable);
  app.post('/save/:key', cloudUnavailable);

  // ==================== STATIC FRONTEND ====================
  app.use('/assets', express.static(path.join(__dirname, 'assets')));
  app.use('/js', express.static(path.join(__dirname, 'js')));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/favicon.ico', (_req, res) => {
    res.sendFile(path.join(__dirname, 'assets', 'crabcode_logo.png'));
  });

  app.get(['/', '/index.html'], (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  return app;
}

function resolvePort() {
  const envPort = process.env.PORT;
  const nginxPort = process.env.NGINX_PORT;
  if (envPort && (!nginxPort || envPort !== nginxPort)) {
    const parsed = Number(envPort);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return Number(process.env.DEFAULT_APP_PORT) || 3000;
}

if (require.main === module) {
  const PORT = resolvePort();
  const app = createApp();
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`CrabCode IDE running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error(`Failed to start CrabCode IDE on port ${PORT}:`, err);
    process.exit(1);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 1500).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = { createApp, isValidKey, resolvePort };
