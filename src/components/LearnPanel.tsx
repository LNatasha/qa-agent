export function LearnPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="border-t border-zinc-900 p-4 text-xs font-mono text-zinc-500">
      Learning loop — coming soon. <button onClick={onClose} className="text-cyan-400 ml-2">Close</button>
    </div>
  );
}
