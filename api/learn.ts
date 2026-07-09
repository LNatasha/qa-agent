import { query } from '@anthropic-ai/claude-agent-sdk';
import { GoogleGenAI } from '@google/genai';
import type { LearnRequest, LearnResponse, LearnSaveRequest, LearnSaveResponse, VaultNodeType } from '@/src/types.js';
import { getVaultList, saveToVault, rebuildGraph } from './vault.js';
import matter from 'gray-matter';

export async function searchWithGemini(searchQuery: string): Promise<string> {
  const genai = new GoogleGenAI({ apiKey: process.env['GEMINI_API_KEY']! });
  const response = await genai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Find comprehensive information about "${searchQuery}" as a software testing tool or technique. Include: what it is, key strengths, when to use it, domains it covers (web/api/mobile/performance), language support, and comparisons to similar tools/techniques.`,
    config: { tools: [{ googleSearch: {} }] },
  });
  return response.text ?? '';
}

export function detectConflicts(name: string, existingSlugs: string[]): string[] {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return existingSlugs.filter(slug => slug === normalized);
}

export async function generateVaultDraft(
  name: string,
  example: string,
  searchResult: string,
  existingSlugs: string[],
): Promise<string> {
  const existingLinks = existingSlugs.map(s => `[[${s}]]`).join(', ');

  let latestText = '';

  for await (const msg of query({
    prompt: `Create an Obsidian vault .md file for "${name}" using EXACTLY this format:

---
type: [tool or technique]
name: ${name}
domains: [comma-separated subset of: web, api, mobile, performance]
language: [comma-separated languages — omit if technique]
tags: [3-5 relevant lowercase tags]
---

[1-2 sentence description]

## Strengths
- [bullet points]

## When to use
[1 paragraph]

## Related techniques/tools
[Use [[wikilinks]] — only link to entries that exist: ${existingLinks}]

## Examples
[Show the user-provided example, explained]

---
User-provided example: ${example}

Research context (from Gemini web search):
${searchResult}

Return ONLY the file content — no explanation before or after.`,
    options: {
      systemPrompt: 'You are a QA knowledge base assistant. Generate structured Obsidian vault entries based on the provided research context and user example.',
      tools: [],
      maxTurns: 1,
    },
  })) {
    if (msg.type === 'assistant') {
      if (msg.error) throw new Error(`Claude error: ${msg.error}`);
      for (const block of msg.message?.content ?? []) {
        if (block.type === 'text') latestText = (block as { type: 'text'; text: string }).text;
      }
    }
  }

  if (!latestText) throw new Error('Claude returned no text content for vault draft generation');
  return latestText;
}

function typeFromDraft(draft: string): VaultNodeType {
  try {
    const { data } = matter(draft);
    const t = data['type'] as string;
    if (t === 'tool' || t === 'technique' || t === 'example') return t;
  } catch (err) {
    console.error('Failed to parse vault draft frontmatter:', err);
  }
  return 'tool';
}

function slugFromName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function handleLearn(req: LearnRequest, vaultDir?: string): Promise<LearnResponse> {
  const dir = vaultDir ?? process.cwd() + '/vault';
  const existingEntries = getVaultList(dir);
  const existingSlugs = existingEntries.map(e => e.slug);
  const conflicts = detectConflicts(req.name, existingSlugs);
  const searchResult = await searchWithGemini(req.name + (req.clarifications ? ` — ${req.clarifications}` : ''));
  const draft = await generateVaultDraft(req.name, req.example, searchResult, existingSlugs);
  const type = typeFromDraft(draft);
  const slug = slugFromName(req.name);
  return { draft, slug, type, conflicts };
}

export function handleLearnSave(req: LearnSaveRequest, vaultDir: string): LearnSaveResponse {
  const subfolder =
    req.type === 'technique' ? 'techniques' : req.type === 'example' ? 'examples' : 'tools';
  const filePath = saveToVault(vaultDir, subfolder, req.slug, req.content);
  rebuildGraph(vaultDir);
  return { saved: true, path: filePath };
}
