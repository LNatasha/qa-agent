import { Router } from 'express';
import { handleChat } from './chat.js';
import type { ChatRequest } from '@/src/types.js';

export default function buildChatRoutes(): Router {
  const router = Router();

  router.post('/chat', async (req, res) => {
    try {
      const body = req.body as ChatRequest;
      if (!body.messages || !body.step || !body.model) {
        res.status(400).json({ error: 'messages, step, and model are required' });
        return;
      }
      const result = await handleChat(body);
      res.json(result);
    } catch (err) {
      console.error('Chat error:', err);
      res.status(500).json({ error: 'Chat failed' });
    }
  });

  return router;
}
