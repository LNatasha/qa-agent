import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock vault module
vi.mock('@/api/vault.js', () => ({
  getVaultList: vi.fn(() => [
    { slug: 'playwright', name: 'Playwright', type: 'tool', domains: ['web'], tags: ['e2e'] },
  ]),
  getVaultEntry: vi.fn((_, slug) =>
    slug === 'playwright'
      ? { slug: 'playwright', name: 'Playwright', type: 'tool', domains: ['web'], tags: ['e2e'], content: 'body', frontmatter: {} }
      : null
  ),
}));

// Import after mock
const { default: buildVaultRoutes } = await import('@/api/vault-routes.js');

const app = express();
app.use(express.json());
app.use('/api', buildVaultRoutes('vault'));

describe('GET /api/vault', () => {
  it('returns list of vault entries', async () => {
    const res = await request(app).get('/api/vault');
    expect(res.status).toBe(200);
    expect(res.body.entries).toHaveLength(1);
    expect(res.body.entries[0].slug).toBe('playwright');
  });
});

describe('GET /api/vault/:slug', () => {
  it('returns full entry for known slug', async () => {
    const res = await request(app).get('/api/vault/playwright');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Playwright');
    expect(res.body.content).toBe('body');
  });

  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/vault/nonexistent');
    expect(res.status).toBe(404);
  });
});
