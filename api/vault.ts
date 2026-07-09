import matter from 'gray-matter';
import Graph from 'graphology';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import type { VaultNode, VaultListItem, VaultNodeType, Domain } from '@/src/types.js';

let _graph: Graph | null = null;

export function parseVaultFile(filePath: string): VaultNode {
  const raw = readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const slug = path.basename(filePath, '.md');
  return {
    slug,
    name: typeof data['name'] === 'string' ? data['name'] : slug,
    type: (data['type'] as VaultNodeType) ?? 'tool',
    domains: (data['domains'] as Domain[]) ?? [],
    tags: (data['tags'] as string[]) ?? [],
    content: content.trim(),
    frontmatter: data,
  };
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function extractWikilinks(content: string): string[] {
  const matches = [...content.matchAll(/\[\[([^\]]+)\]\]/g)];
  return matches.map(m => slugify(m[1] as string));
}

function readSubfolder(dir: string): VaultNode[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => parseVaultFile(path.join(dir, f)));
}

export function buildGraph(vaultDir: string): Graph {
  const graph = new Graph({ type: 'directed', multi: false });
  const subfolders = ['techniques', 'tools', 'examples'];
  const nodes: VaultNode[] = subfolders.flatMap(sub => readSubfolder(path.join(vaultDir, sub)));

  for (const node of nodes) {
    if (!graph.hasNode(node.slug)) {
      graph.addNode(node.slug, node);
    }
  }

  for (const node of nodes) {
    for (const target of extractWikilinks(node.content)) {
      if (graph.hasNode(target) && !graph.hasEdge(node.slug, target)) {
        graph.addEdge(node.slug, target);
      }
    }
  }

  return graph;
}

export function initGraph(vaultDir: string): void {
  _graph = buildGraph(vaultDir);
}

export function rebuildGraph(vaultDir: string): void {
  _graph = buildGraph(vaultDir);
}

export function getGraph(): Graph {
  if (!_graph) throw new Error('Graph not initialized — call initGraph() first');
  return _graph;
}

export function getVaultList(vaultDir: string): VaultListItem[] {
  const subfolders = ['techniques', 'tools', 'examples'];
  return subfolders
    .flatMap(sub => readSubfolder(path.join(vaultDir, sub)))
    .map(({ slug, name, type, domains, tags }) => ({ slug, name, type, domains, tags }));
}

export function getVaultEntry(vaultDir: string, slug: string): VaultNode | null {
  const subfolders = ['techniques', 'tools', 'examples'];
  for (const sub of subfolders) {
    const filePath = path.join(vaultDir, sub, `${slug}.md`);
    if (existsSync(filePath)) return parseVaultFile(filePath);
  }
  return null;
}

export function saveToVault(
  vaultDir: string,
  subfolder: 'tools' | 'techniques' | 'examples',
  slug: string,
  content: string,
): string {
  const dir = path.join(vaultDir, subfolder);
  mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.md`);
  writeFileSync(filePath, content, 'utf-8');
  return filePath;
}
