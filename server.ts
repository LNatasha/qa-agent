import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { initGraph } from './api/vault.js';
import buildVaultRoutes from './api/vault-routes.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3000;
const VAULT_DIR = path.join(process.cwd(), 'vault');

app.use(express.json());

initGraph(VAULT_DIR);
app.use('/api', buildVaultRoutes(VAULT_DIR));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const path = await import('path');
    const distPath = path.default.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.default.join(distPath, 'index.html')));
  }
  const server = app.listen(PORT, '0.0.0.0', () =>
    console.log(`QA Agent running on http://localhost:${PORT}`)
  );
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
}

start().catch(err => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
