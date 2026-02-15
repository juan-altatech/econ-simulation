import { MonthSnapshot } from '../engine/types';

interface SimulationControlsProps {
  isPlaying: boolean;
  speed: number;
  currentMonth: number;
  currentSnapshot: MonthSnapshot;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onJumpToMonth: (month: number) => void;
}

export default function SimulationControls({
  isPlaying, speed, currentMonth, currentSnapshot,
  onPlay, onPause, onStepForward, onStepBackward, onSpeedChange, onJumpToMonth,
}: SimulationControlsProps) {
  return (
    <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur border-b border-slate-700/50 px-4 py-2">
      {/* Date Display */}
      <div className="flex items-center gap-2 mr-2">
        <span className="text-lg font-bold text-white font-mono">{currentSnapshot.date}</span>
        <span className="text-xs text-slate-500">Month {currentMonth}</span>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onStepBackward}
          disabled={currentMonth <= 0}
          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Step Back"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/></svg>
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>
          )}
        </button>

        <button
          onClick={onStepForward}
          disabled={currentMonth >= 240}
          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Step Forward"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.555 5.168A1 1 0 0010 6v2.798L4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4z"/></svg>
        </button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-2 ml-2">
        <span className="text-[10px] text-slate-500 uppercase">Speed</span>
        <input
          type="range"
          min={0.5} max={12} step={0.5}
          value={speed}
          onChange={e => onSpeedChange(parseFloat(e.target.value))}
          className="w-20 h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-xs text-slate-300 font-mono w-14">{speed} mo/s</span>
      </div>

      {/* Timeline Scrubber */}
      <div className="flex-1 mx-4">
        <input
          type="range"
          min={0} max={240} step={1}
          value={currentMonth}
          onChange={e => onJumpToMonth(parseInt(e.target.value))}
          className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
          <span>Feb 2026</span>
          <span>2031</span>
          <span>2036</span>
          <span>2041</span>
          <span>Feb 2046</span>
        </div>
      </div>
    </div>
  );
}
