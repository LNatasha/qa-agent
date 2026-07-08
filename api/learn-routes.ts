import { Router } from 'express';
import { handleLearn, handleLearnSave } from './learn.js';
import type { LearnRequest, LearnSaveRequest } from '@/src/types.js';

export default function buildLearnRoutes(vaultDir: string): Router {
  const router = Router();

  router.post('/learn', async (req, res) => {
    try {
      const body = req.body as LearnRequest;
      if (!body.name || !body.example) {
        res.status(400).json({ error: 'name and example are required' });
        return;
      }
      const result = await handleLearn(body, vaultDir);
      res.json(result);
    } catch (err) {
      console.error('Learn error:', err);
      res.status(500).json({ error: 'Learning failed' });
    }
  });

  router.post('/learn/save', (req, res) => {
    try {
      const body = req.body as LearnSaveRequest;
      if (!body.slug || !body.content || !body.type) {
        res.status(400).json({ error: 'slug, type, and content are required' });
        return;
      }
      const result = handleLearnSave(body, vaultDir);
      res.json(result);
    } catch (err) {
      console.error('Learn save error:', err);
      res.status(500).json({ error: 'Save failed' });
    }
  });

  return router;
}
