import { randomUUID } from 'crypto';
import type { GeneratedFile } from '@/src/types.js';

const store = new Map<string, GeneratedFile>();

export function storeFile(name: string, content: string, contentType: string): string {
  const id = randomUUID();
  store.set(id, { id, name, content, contentType });
  return id;
}

export function getFile(id: string): GeneratedFile | undefined {
  return store.get(id);
}

export function clearFiles(): void {
  store.clear();
}
