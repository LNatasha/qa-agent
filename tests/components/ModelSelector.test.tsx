import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelSelector } from '@/src/components/ModelSelector.js';

describe('ModelSelector', () => {
  it('shows default model as selected', () => {
    render(<ModelSelector value="claude-sonnet-4-6" onChange={vi.fn()} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('claude-sonnet-4-6');
  });

  it('calls onChange when a different model is selected', () => {
    const onChange = vi.fn();
    render(<ModelSelector value="claude-sonnet-4-6" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'claude-opus-4-8' } });
    expect(onChange).toHaveBeenCalledWith('claude-opus-4-8');
  });
});
