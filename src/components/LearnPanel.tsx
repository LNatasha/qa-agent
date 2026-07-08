import { useState } from 'react';
import { Search, Save, X, AlertTriangle } from 'lucide-react';
import type { LearnResponse } from '@/src/types.js';

interface Props { onClose: () => void }

type Phase = 'form' | 'loading' | 'review' | 'saved';

export function LearnPanel({ onClose }: Props) {
  const [name, setName] = useState('');
  const [example, setExample] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [result, setResult] = useState<LearnResponse | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  async function search() {
    if (!name.trim() || !example.trim()) { setError('Both name and example are required.'); return; }
    setError('');
    setPhase('loading');
    try {
      const res = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), example: example.trim() }),
      });
      const data: LearnResponse = await res.json();
      setResult(data);
      setDraft(data.draft);
      setPhase('review');
    } catch {
      setError('Search failed. Check your API keys and try again.');
      setPhase('form');
    }
  }

  async function save() {
    if (!result) return;
    try {
      await fetch('/api/learn/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: result.slug, type: result.type, content: draft }),
      });
      setPhase('saved');
    } catch {
      setError('Save failed. Try again.');
    }
  }

  return (
    <div className="border-t border-zinc-900 bg-zinc-950 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono font-semibold text-cyan-400 tracking-widest uppercase">Teach me something new</p>
        <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400"><X className="w-4 h-4" /></button>
      </div>

      {phase === 'form' && (
        <div className="space-y-3">
          {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tool or technique name…"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-700"
          />
          <textarea
            value={example}
            onChange={e => setExample(e.target.value)}
            placeholder="Paste an example of how this is used in practice…"
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-700 resize-none"
          />
          <button
            onClick={search}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono rounded-xl transition-colors"
          >
            <Search className="w-3.5 h-3.5" />Search
          </button>
        </div>
      )}

      {phase === 'loading' && (
        <p className="text-xs font-mono text-zinc-500 animate-pulse">Searching the web and generating vault entry…</p>
      )}

      {phase === 'review' && result && (
        <div className="space-y-3">
          {result.conflicts.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs font-mono text-amber-300">
                Possible overlap with: {result.conflicts.join(', ')}. Consider editing the draft to add a comparison section instead of creating a duplicate.
              </p>
            </div>
          )}
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Review and edit before saving</p>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={14}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-700 resize-y"
          />
          {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono rounded-xl transition-colors"
            >
              <Save className="w-3.5 h-3.5" />Save to vault
            </button>
            <button onClick={() => setPhase('form')} className="px-4 py-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded-xl transition-colors">
              Back
            </button>
          </div>
        </div>
      )}

      {phase === 'saved' && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-emerald-400">Saved to vault — knowledge base updated.</p>
          <button onClick={onClose} className="text-xs font-mono text-zinc-500 hover:text-zinc-300">Close</button>
        </div>
      )}
    </div>
  );
}
