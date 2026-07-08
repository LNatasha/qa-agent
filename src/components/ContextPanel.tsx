import { Download } from 'lucide-react';
import type { Step } from '@/src/types.js';

const STEPS: { key: Step; label: string }[] = [
  { key: 'intake', label: 'Intake' },
  { key: 'technique', label: 'Technique' },
  { key: 'test-cases', label: 'Test Cases' },
  { key: 'tool', label: 'Tool' },
  { key: 'code', label: 'Code' },
];

interface Props {
  step: Step;
  files: Array<{ id: string; name: string }>;
}

export function ContextPanel({ step, files }: Props) {
  const currentIdx = STEPS.findIndex(s => s.key === step);

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      {/* Step indicator */}
      <div>
        <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-3">Progress</p>
        <div className="flex flex-col gap-1">
          {STEPS.map((s, i) => {
            const isDone = i < currentIdx;
            const isActive = i === currentIdx;
            return (
              <div
                key={s.key}
                data-active={isActive ? 'true' : undefined}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  isActive ? 'bg-cyan-950 text-cyan-400 border border-cyan-900' :
                  isDone ? 'text-zinc-500' : 'text-zinc-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400' : isDone ? 'bg-zinc-600' : 'bg-zinc-800'}`} />
                {s.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Downloads */}
      {files.length > 0 && (
        <div>
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-3">Downloads</p>
          <div className="flex flex-col gap-2">
            {files.map(f => (
              <a
                key={f.id}
                href={`/api/download/${f.id}`}
                download={f.name}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 hover:text-cyan-400 hover:border-cyan-900 transition-colors"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{f.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
