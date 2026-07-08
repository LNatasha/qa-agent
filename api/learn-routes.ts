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
      // Validate slug is safe (alphanumeric and hyphens only)
      if (!/^[a-z0-9-]+$/.test(body.slug)) {
        res.status(400).json({ error: 'slug must contain only lowercase letters, numbers, and hyphens' });
        return;
      }
      const VALID_TYPES = ['tool', 'technique', 'example'] as const;
      if (!VALID_TYPES.includes(body.type as typeof VALID_TYPES[number])) {
        res.status(400).json({ error: 'type must be one of: tool, technique, example' });
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
