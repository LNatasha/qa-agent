import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VaultEntry } from '@/src/components/VaultEntry.js';

const entry = {
  slug: 'playwright',
  name: 'Playwright',
  type: 'tool' as const,
  domains: ['web' as const, 'api' as const],
  tags: ['e2e', 'cross-browser'],
  content: '## Strengths\n- Fast',
  frontmatter: {},
};

describe('VaultEntry', () => {
  it('renders name and type', () => {
    render(<VaultEntry entry={entry} vaultPath="~/vault" />);
    expect(screen.getByText('Playwright')).toBeDefined();
    expect(screen.getByText('tool')).toBeDefined();
  });

  it('renders Obsidian deep-link', () => {
    render(<VaultEntry entry={entry} vaultPath="/Users/Natasha/Claude/qa-agent/vault" />);
    const link = screen.getByRole('link');
    expect((link as HTMLAnchorElement).href).toContain('obsidian://open');
  });
});
