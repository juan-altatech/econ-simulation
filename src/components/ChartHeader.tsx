import { useState, useRef, useEffect } from 'react';

interface ChartHeaderProps {
  title: string;
  tooltip: string;
}

export default function ChartHeader({ title, tooltip }: ChartHeaderProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-1.5 mb-3">
      <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setOpen(o => !o)}
          className="p-0.5 rounded-full text-slate-600 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
          aria-label="Chart info"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        {open && (
          <div
            ref={popoverRef}
            className="absolute left-0 top-full mt-1.5 z-40 w-72 rounded-lg bg-slate-800 border border-slate-700/60 shadow-xl shadow-black/30 p-3 text-xs text-slate-300 leading-relaxed"
            style={{ animation: 'popIn 0.12s ease-out' }}
          >
            <div className="absolute -top-1.5 left-3 w-3 h-3 bg-slate-800 border-l border-t border-slate-700/60 rotate-45" />
            <p>{tooltip}</p>
          </div>
        )}
      </div>
      <style>{`@keyframes popIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
