// Vault
export type VaultNodeType = 'tool' | 'technique' | 'example';
export type Domain = 'web' | 'api' | 'mobile' | 'performance';

export interface VaultNode {
  slug: string;
  name: string;
  type: VaultNodeType;
  domains: Domain[];
  tags: string[];
  content: string; // raw markdown body (no frontmatter)
  frontmatter: Record<string, unknown>;
}

export interface VaultListItem {
  slug: string;
  name: string;
  type: VaultNodeType;
  domains: Domain[];
  tags: string[];
}

// Chat
export type Step = 'intake' | 'technique' | 'test-cases' | 'tool' | 'code';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  domain?: Domain;
  stack?: string;
  technique?: string; // slug of chosen technique
  tool?: string;      // slug of chosen tool
}

export interface ChatRequest {
  messages: ChatMessage[];
  step: Step;
  model: string;
  context: ChatContext;
}

export interface GeneratedFile {
  id: string;
  name: string;
  content: string;
  contentType: string; // 'text/markdown' or 'text/plain'
}

export interface ChatResponse {
  content: string;
  readyToAdvance: boolean;
  file?: { id: string; name: string };
}

// Learn
export interface LearnRequest {
  name: string;
  example: string;
  clarifications?: string;
}

export interface LearnResponse {
  draft: string;  // full .md content including frontmatter
  slug: string;
  type: VaultNodeType;
  conflicts: string[]; // slugs of possibly overlapping vault entries
}

export interface LearnSaveRequest {
  slug: string;
  type: VaultNodeType;
  content: string; // validated .md (may be user-edited)
}

export interface LearnSaveResponse {
  saved: boolean;
  path: string;
}
