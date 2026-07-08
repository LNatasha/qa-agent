import { useState } from 'react';
import { Cpu, BookOpen } from 'lucide-react';
import { ModelSelector } from './components/ModelSelector.js';
import { ChatView } from './views/ChatView.js';
import { VaultView } from './views/VaultView.js';

type View = 'chat' | 'vault';

export default function App() {
  const [view, setView] = useState<View>('chat');
  const [model, setModel] = useState('claude-sonnet-4-6');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Top nav */}
      <header className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span className="font-mono font-semibold text-zinc-100 text-sm">QA Agent</span>
        </div>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setView('chat')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${view === 'chat' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setView('vault')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${view === 'vault' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />Vault</span>
          </button>
        </nav>
        <ModelSelector value={model} onChange={setModel} />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {view === 'chat' ? <ChatView model={model} /> : <VaultView />}
      </main>
    </div>
  );
}
