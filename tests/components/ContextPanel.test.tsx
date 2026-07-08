import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContextPanel } from '@/src/components/ContextPanel.js';

describe('ContextPanel', () => {
  it('highlights the current step', () => {
    render(
      <ContextPanel
        step="technique"
        files={[]}
      />
    );
    const stepEl = screen.getByText('Technique');
    expect(stepEl.closest('[data-active]')).not.toBeNull();
  });

  it('shows download button for each file', () => {
    render(
      <ContextPanel
        step="test-cases"
        files={[{ id: 'abc', name: 'test-cases.md' }]}
      />
    );
    expect(screen.getByText('test-cases.md')).toBeDefined();
    const link = screen.getByRole('link');
    expect((link as HTMLAnchorElement).href).toContain('/api/download/abc');
  });
});
