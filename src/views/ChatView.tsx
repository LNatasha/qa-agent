import { useState, useRef, useEffect } from 'react';
import { Send, BookOpen } from 'lucide-react';
import { MessageThread } from '@/src/components/MessageThread.js';
import { ContextPanel } from '@/src/components/ContextPanel.js';
import { LearnPanel } from '@/src/components/LearnPanel.js';
import type { ChatMessage, Step, ChatContext, ChatResponse } from '@/src/types.js';

interface Props { model: string }

const STEP_ORDER: Step[] = ['intake', 'technique', 'test-cases', 'tool', 'code'];

export function ChatView({ model }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! Describe the testing problem you\'re facing and I\'ll guide you through the best technique, test cases, and tool for the job.' }
  ]);
  const [step, setStep] = useState<Step>('intake');
  const [context, setContext] = useState<ChatContext>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [readyToAdvance, setReadyToAdvance] = useState(false);
  const [files, setFiles] = useState<Array<{ id: string; name: string }>>([]);
  const [showLearn, setShowLearn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function send(userText: string) {
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setReadyToAdvance(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, step, model, context }),
      });
      const data: ChatResponse = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      setReadyToAdvance(data.readyToAdvance);
      if (data.file) setFiles(prev => [...prev, data.file!]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function advance() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[idx + 1]!);
      setReadyToAdvance(false);
    }
  }

  return (
    <div className="h-full flex">
      {/* Conversation panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <MessageThread messages={messages} loading={loading} />
          {readyToAdvance && step !== 'code' && (
            <div className="mt-4 flex justify-start">
              <button
                onClick={advance}
                className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 text-xs font-mono rounded-xl transition-colors"
              >
                Continue →
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-zinc-900 p-4 flex gap-3 items-end">
          <button
            onClick={() => setShowLearn(v => !v)}
            className="shrink-0 px-3 py-2 text-xs font-mono text-zinc-500 hover:text-cyan-400 border border-zinc-800 hover:border-cyan-900 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />Teach
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && input.trim()) { e.preventDefault(); send(input.trim()); } }}
            placeholder="Describe your testing problem…"
            rows={2}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-700 resize-none"
          />
          <button
            onClick={() => input.trim() && send(input.trim())}
            disabled={!input.trim() || loading}
            className="shrink-0 p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Learn panel (inline) */}
        {showLearn && <LearnPanel onClose={() => setShowLearn(false)} />}
      </div>

      {/* Context panel */}
      <aside className="w-72 shrink-0 border-l border-zinc-900 overflow-y-auto">
        <ContextPanel step={step} files={files} />
      </aside>
    </div>
  );
}
