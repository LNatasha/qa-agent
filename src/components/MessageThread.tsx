import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/src/types.js';

interface Props {
  messages: ChatMessage[];
  loading: boolean;
}

export function MessageThread({ messages, loading }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            m.role === 'user'
              ? 'bg-cyan-950 border border-cyan-900 text-cyan-100'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
          }`}>
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
