import { describe, it, expect, vi } from 'vitest';
import { detectConflicts, generateVaultDraft } from '@/api/learn.js';

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: '---\ntype: tool\nname: Cypress\ndomains: [web]\ntags: [e2e]\n---\nCypress body.' }],
      }),
    },
  })),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({ text: 'Cypress is a JS testing framework.' }),
    },
  })),
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
