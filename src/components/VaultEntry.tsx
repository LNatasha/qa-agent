import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import type { VaultNode } from '@/src/types.js';

const DOMAIN_COLOURS: Record<string, string> = {
  web: 'text-cyan-400 bg-cyan-950/50 border-cyan-900',
  api: 'text-violet-400 bg-violet-950/50 border-violet-900',
  mobile: 'text-emerald-400 bg-emerald-950/50 border-emerald-900',
  performance: 'text-amber-400 bg-amber-950/50 border-amber-900',
};

interface Props {
  entry: VaultNode;
  vaultPath: string;
}

export function VaultEntry({ entry, vaultPath }: Props) {
  const [expanded, setExpanded] = useState(false);
  const subfolder =
    entry.type === 'technique' ? 'techniques' : entry.type === 'example' ? 'examples' : 'tools';
  const obsidianHref = `obsidian://open?path=${encodeURIComponent(`${vaultPath}/${subfolder}/${entry.slug}.md`)}`;

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-900/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-zinc-100 text-sm truncate">{entry.name}</p>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                {entry.type}
              </span>
              {entry.domains.map(d => (
                <span
                  key={d}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${DOMAIN_COLOURS[d] ?? 'text-zinc-400 bg-zinc-900 border-zinc-800'}`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
        <a
          href={obsidianHref}
          onClick={e => e.stopPropagation()}
          className="shrink-0 ml-4 p-1.5 text-zinc-600 hover:text-cyan-400 transition-colors"
          title="Open in Obsidian"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-zinc-900 pt-4 prose prose-invert prose-sm max-w-none prose-p:text-zinc-300 prose-headings:text-zinc-200 prose-code:text-cyan-300">
          <ReactMarkdown>{entry.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
