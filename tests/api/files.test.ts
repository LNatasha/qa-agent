import { describe, it, expect, beforeEach } from 'vitest';
import { storeFile, getFile, clearFiles } from '@/api/files.js';

beforeEach(() => clearFiles());

describe('storeFile / getFile', () => {
  it('stores and retrieves a file by id', () => {
    const id = storeFile('test-cases.md', '# Test Cases\n- TC1', 'text/markdown');
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);

    const file = getFile(id);
    expect(file).toBeDefined();
    expect(file!.name).toBe('test-cases.md');
    expect(file!.content).toBe('# Test Cases\n- TC1');
    expect(file!.contentType).toBe('text/markdown');
  });

  it('returns undefined for unknown id', () => {
    expect(getFile('nonexistent')).toBeUndefined();
  });
});
