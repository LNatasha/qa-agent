import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { VaultEntry } from '@/src/components/VaultEntry.js';
import type { VaultNode, Domain, VaultNodeType } from '@/src/types.js';

const DOMAINS: Domain[] = ['web', 'api', 'mobile', 'performance'];
const TYPES: VaultNodeType[] = ['tool', 'technique', 'example'];
const VAULT_PATH = '/Users/Natasha/Claude/qa-agent/vault';

export function VaultView() {
  const [entries, setEntries] = useState<VaultNode[]>([]);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<VaultNodeType | 'all'>('all');

  useEffect(() => {
    fetch('/api/vault')
      .then(r => r.json())
      .then(data => {
        const slugs: string[] = (data.entries as Array<{ slug: string }>).map(e => e.slug);
        return Promise.all(slugs.map(s => fetch(`/api/vault/${s}`).then(r => r.json())));
      })
      .then(full => setEntries(full as VaultNode[]))
      .catch(console.error);
  }, []);

  const filtered = entries.filter(e => {
    if (domainFilter !== 'all' && !e.domains.includes(domainFilter)) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (
      search &&
      !e.name.toLowerCase().includes(search.toLowerCase()) &&
      !e.tags.some(t => t.includes(search.toLowerCase()))
    )
      return false;
    return true;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools and techniques…"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-700"
            />
          </div>
          <select
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value as Domain | 'all')}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-700"
          >
            <option value="all">All domains</option>
            {DOMAINS.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as VaultNodeType | 'all')}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-700"
          >
            <option value="all">All types</option>
            {TYPES.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Entry list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-zinc-600 font-mono text-sm text-center py-12">
              No entries match the current filters.
            </p>
          ) : (
            filtered.map(e => <VaultEntry key={e.slug} entry={e} vaultPath={VAULT_PATH} />)
          )}
        </div>
      </div>
    </div>
  );
}
