import { describe, it, expect, vi } from 'vitest';
import { detectConflicts, generateVaultDraft } from '@/api/learn.js';

vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: vi.fn().mockImplementation(() => {
    async function* gen() {
      yield {
        type: 'assistant',
        message: {
          content: [{ type: 'text', text: '---\ntype: tool\nname: Cypress\ndomains: [web]\ntags: [e2e]\n---\nCypress body.' }],
        },
        parent_tool_use_id: null,
        uuid: 'test-uuid',
        session_id: 'test-session',
        error: undefined,
      };
    }
    return gen();
  }),
}));

vi.mock('@/api/vault.js', () => ({
  getVaultList: vi.fn(() => []),
  saveToVault: vi.fn(() => '/vault/tools/cypress.md'),
  rebuildGraph: vi.fn(),
}));

describe('detectConflicts', () => {
  it('flags entries with similar names', () => {
    const conflicts = detectConflicts('Cypress', ['playwright', 'cypress', 'appium']);
    expect(conflicts).toContain('cypress');
  });

  it('returns empty array when no conflicts', () => {
    const conflicts = detectConflicts('Cypress', ['playwright', 'appium', 'k6']);
    expect(conflicts).toEqual([]);
  });
});

describe('generateVaultDraft', () => {
  it('returns a string containing frontmatter', async () => {
    const draft = await generateVaultDraft('Cypress', 'cy.get("button").click()', 'search result', ['playwright']);
    expect(draft).toContain('---');
    expect(draft).toContain('type:');
  });
});
