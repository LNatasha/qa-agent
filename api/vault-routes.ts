import { Router } from 'express';
import { getVaultList, getVaultEntry } from './vault.js';

export default function buildVaultRoutes(vaultDir: string): Router {
  const router = Router();

  router.get('/vault', (_req, res) => {
    const entries = getVaultList(vaultDir);
    res.json({ entries });
  });

  router.get('/vault/:slug', (req, res) => {
    const entry = getVaultEntry(vaultDir, req.params['slug'] as string);
    if (!entry) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(entry);
  });

  return router;
}
