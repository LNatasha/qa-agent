import { describe, it, expect, vi } from 'vitest';
import { buildGraphContext, buildSystemPrompt } from '@/api/chat.js';
import type { ChatContext } from '@/src/types.js';

vi.mock('@/api/vault.js', () => ({
  getGraph: vi.fn(() => {
    const nodes = new Map([
      ['boundary-value-analysis', { name: 'Boundary Value Analysis', type: 'technique', domains: ['web', 'api'] }],
      ['playwright', { name: 'Playwright', type: 'tool', domains: ['web', 'api'] }],
    ]);
    return {
      forEachNode: (cb: (slug: string, attrs: Record<string, unknown>) => void) => {
        nodes.forEach((attrs, slug) => cb(slug, attrs));
      },
      hasNode: (slug: string) => nodes.has(slug),
      neighbors: (slug: string) => slug === 'boundary-value-analysis' ? ['playwright'] : [],
    };
  }),
}));

describe('buildGraphContext', () => {
  it('returns techniques for the given domain on technique step', () => {
    const ctx: ChatContext = { domain: 'web' };
    const result = buildGraphContext('technique', ctx);
    expect(result).toContain('Boundary Value Analysis');
    expect(result).not.toContain('Playwright');
  });

  it('returns tools linked to the chosen technique on tool step', () => {
    const ctx: ChatContext = { domain: 'web', technique: 'boundary-value-analysis' };
    const result = buildGraphContext('tool', ctx);
    expect(result).toContain('Playwright');
  });
});

describe('buildSystemPrompt', () => {
  it('includes the current step name', () => {
    const prompt = buildSystemPrompt('technique', 'context');
    expect(prompt).toContain('technique');
  });

  it('includes graph context', () => {
    const prompt = buildSystemPrompt('intake', 'some graph context');
    expect(prompt).toContain('some graph context');
  });
});
