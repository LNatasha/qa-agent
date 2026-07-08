import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LearnPanel } from '@/src/components/LearnPanel.js';

global.fetch = vi.fn();

beforeEach(() => {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: async () => ({
      draft: '---\ntype: tool\nname: Cypress\n---\nCypress body.',
      slug: 'cypress',
      type: 'tool',
      conflicts: [],
    }),
  });
});

describe('LearnPanel', () => {
  it('shows form fields for name and example', () => {
    render(<LearnPanel onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText(/tool or technique name/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/example/i)).toBeDefined();
  });

  it('fetches draft when search is submitted', async () => {
    render(<LearnPanel onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/tool or technique name/i), { target: { value: 'Cypress' } });
    fireEvent.change(screen.getByPlaceholderText(/example/i), { target: { value: 'cy.get("button").click()' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/learn', expect.objectContaining({ method: 'POST' })));
  });

  it('shows draft after search completes', async () => {
    render(<LearnPanel onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/tool or technique name/i), { target: { value: 'Cypress' } });
    fireEvent.change(screen.getByPlaceholderText(/example/i), { target: { value: 'cy.get("button").click()' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => expect(screen.getByDisplayValue(/Cypress body/)).toBeDefined());
  });
});
