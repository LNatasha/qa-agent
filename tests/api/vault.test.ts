import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseVaultFile,
  extractWikilinks,
  buildGraph,
  getVaultList,
  getVaultEntry,
} from '@/api/vault.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, '../fixtures');

describe('parseVaultFile', () => {
  it('parses frontmatter and content separately', () => {
    const node = parseVaultFile(path.join(FIXTURES, 'tools/playwright.md'));
    expect(node.slug).toBe('playwright');
    expect(node.name).toBe('Playwright');
    expect(node.type).toBe('tool');
    expect(node.domains).toEqual(['web', 'api']);
    expect(node.content).toContain('browser automation framework');
    expect(node.content).not.toContain('type: tool');
  });
});

describe('extractWikilinks', () => {
  it('extracts [[wikilinks]] as slugs', () => {
    const links = extractWikilinks('See [[E2E Testing]] and [[api-testing]]');
    expect(links).toEqual(['e2e-testing', 'api-testing']);
  });

  it('returns empty array when no wikilinks', () => {
    expect(extractWikilinks('No links here')).toEqual([]);
  });
});

describe('buildGraph', () => {
  it('adds nodes for all .md files', () => {
    const graph = buildGraph(FIXTURES);
    expect(graph.hasNode('playwright')).toBe(true);
    expect(graph.hasNode('e2e-testing')).toBe(true);
  });

  it('adds edges for wikilinks between existing nodes', () => {
    const graph = buildGraph(FIXTURES);
    expect(graph.hasEdge('playwright', 'e2e-testing')).toBe(true);
  });

  it('ignores wikilinks to non-existent nodes', () => {
    const graph = buildGraph(FIXTURES);
    expect(graph.hasNode('api-testing')).toBe(false);
    // no error thrown
  });
});

describe('getVaultList', () => {
  it('returns metadata for all entries', () => {
    const list = getVaultList(FIXTURES);
    expect(list.length).toBe(2);
    const slugs = list.map(e => e.slug);
    expect(slugs).toContain('playwright');
    expect(slugs).toContain('e2e-testing');
  });
});

describe('getVaultEntry', () => {
  it('returns full node for existing slug', () => {
    const entry = getVaultEntry(FIXTURES, 'playwright');
    expect(entry).not.toBeNull();
    expect(entry!.name).toBe('Playwright');
  });

  it('returns null for unknown slug', () => {
    expect(getVaultEntry(FIXTURES, 'nonexistent')).toBeNull();
  });
});
