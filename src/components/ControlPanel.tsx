import React, { useState, useEffect, useRef } from 'react';
import { SimulationParams, TimelinePreset, MonthSnapshot } from '../engine/types';

interface ControlPanelProps {
  params: SimulationParams;
  currentSnapshot: MonthSnapshot;
  onParamsChange: (params: Partial<SimulationParams>) => void;
  onPresetChange: (preset: TimelinePreset) => void;
  onScenarioLoad: (scenario: string) => void;
  onReset: () => void;
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 py-1.5"
      >
        {title}
        <span className="text-[10px]">{open ? '▼' : '▶'}</span>
      </button>
      {open && <div className="space-y-2.5 mt-1">{children}</div>}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, format, unit }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string; unit?: string;
}) {
  const displayValue = format ? format(value) : value.toString();
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-200 font-mono">{displayValue}{unit || ''}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

function InfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      style={{ animation: 'fadeIn 0.15s ease-out' }}
    >
      <div
        className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        style={{ animation: 'slideUp 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700/40 px-6 py-4 flex items-start justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-white">How the Simulator Works</h2>
            <p className="text-xs text-slate-500 mt-0.5">Understanding the AI Economy Diffusion Model</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 text-sm text-slate-300 leading-relaxed">
          {/* Overview */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">Overview</h3>
            <p>
              This simulator models the economic impact of increasingly capable AI systems on the US labor market from February 2026 onward.
              It tracks how <span className="text-white font-medium">~160 million workers</span> across 50 job categories are affected as AI models
              grow in capability, decline in cost, and expand into physical tasks via robotics.
            </p>
          </section>

          {/* Displacement */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">Job Displacement</h3>
            <p className="mb-2">A job becomes eligible for AI displacement when <span className="text-white font-medium">all four conditions</span> are met:</p>
            <div className="bg-slate-800/60 rounded-lg p-3 space-y-1.5 text-xs font-mono text-slate-400 border border-slate-700/30">
              <div><span className="text-blue-400">1.</span> AI capability <span className="text-slate-200">&ge;</span> job cognitive complexity</div>
              <div><span className="text-blue-400">2.</span> AI physical capability <span className="text-slate-200">&ge;</span> 50% of job physical requirement</div>
              <div><span className="text-blue-400">3.</span> AI cost per hour <span className="text-slate-200">&lt;</span> human hourly wage <span className="text-slate-200">&times;</span> displacement threshold</div>
              <div><span className="text-blue-400">4.</span> AI reliability <span className="text-slate-200">&ge;</span> sector-specific floor (e.g., 0.95 for healthcare)</div>
            </div>
            <p className="mt-2">
              Displacement follows an <span className="text-white font-medium">S-curve</span> (logistic function) &mdash; slow at first as early adopters pilot,
              then accelerating through mainstream adoption, and finally tapering as residual human roles remain. Jobs with
              high human-interaction scores displace more slowly.
            </p>
          </section>

          {/* AI Models */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">AI Model Releases</h3>
            <p>
              Models are released in <span className="text-white font-medium">discrete steps</span>, not continuously. Each release bumps cognitive
              capability, physical capability, and reliability. Between releases, displacement continues for
              already-eligible jobs, but no new categories become eligible.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: 'Aggressive', detail: 'Every 3-4 mo, +8-12 pts', color: 'text-red-400' },
                { label: 'Medium', detail: 'Every 5-6 mo, +5-8 pts', color: 'text-amber-400' },
                { label: 'Slow', detail: 'Every 8-10 mo, +3-5 pts', color: 'text-emerald-400' },
              ].map(t => (
                <div key={t.label} className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/20">
                  <div className={`text-xs font-semibold ${t.color}`}>{t.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{t.detail}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Price matters */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">Price Matters</h3>
            <p>
              Even when AI is <em>capable</em> of a job, it won&apos;t displace workers if it&apos;s too expensive.
              The <span className="text-white font-medium">displacement threshold</span> (default 50%) means AI must cost less than half
              of the human hourly wage. Token prices start at ~$1/$3 per 1M (input/output) and decline over time.
              Raising the cost slider dramatically reduces displacement.
            </p>
          </section>

          {/* New Jobs */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">New Job Creation</h3>
            <p className="mb-2">The model generates four types of emerging roles:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { type: 'AI-Adjacent', desc: 'Prompt engineers, AI trainers, auditors', color: 'border-blue-500/30 bg-blue-500/5' },
                { type: 'New Category', desc: 'Entirely new industries enabled by AI', color: 'border-violet-500/30 bg-violet-500/5' },
                { type: 'Human Premium', desc: 'Roles where human-ness is the product', color: 'border-amber-500/30 bg-amber-500/5' },
                { type: 'Oversight', desc: 'AI ethics, regulation, compliance', color: 'border-emerald-500/30 bg-emerald-500/5' },
              ].map(j => (
                <div key={j.type} className={`rounded-lg p-2 border ${j.color}`}>
                  <div className="text-xs font-semibold text-slate-200">{j.type}</div>
                  <div className="text-[10px] text-slate-500">{j.desc}</div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500 italic">
              New jobs are speculative projections. The creation rate and salary are configurable.
            </p>
          </section>

          {/* Economics */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">Economic Effects</h3>
            <p>
              The model tracks downstream compounding effects: GDP composition (human, augmented, AI-only labor),
              tax revenue, consumer spending, corporate profits, government safety-net spending,
              income distribution across percentiles, and the Gini coefficient for inequality.
              AI-augmented workers get a productivity boost of 1.5x, which increases GDP even as jobs shift.
            </p>
          </section>

          {/* How to use */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Using the Simulator</h3>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p><span className="text-white font-medium">Play/Pause</span> &mdash; run the simulation forward month-by-month, or step manually.</p>
              <p><span className="text-white font-medium">Timeline presets</span> &mdash; choose how fast AI capabilities advance.</p>
              <p><span className="text-white font-medium">Scenarios</span> &mdash; load named parameter combos for optimistic, baseline, or shock narratives.</p>
              <p><span className="text-white font-medium">Override sliders</span> &mdash; manually set AI capability, physical capability, or reliability to explore &ldquo;what if&rdquo; scenarios.</p>
              <p><span className="text-white font-medium">Scrub the timeline</span> &mdash; drag to jump to any point in the 20-year window.</p>
            </div>
          </section>

          {/* Key insight */}
          <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-300 font-medium">
              The most interesting insight is <span className="text-white">compounding</span>: small monthly changes
              accumulate into massive shifts over 5&ndash;10 years. Watch for the hockey stick.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur border-t border-slate-700/40 px-6 py-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

export default function ControlPanel({ params, currentSnapshot, onParamsChange, onPresetChange, onScenarioLoad, onReset }: ControlPanelProps) {
  const [showInfo, setShowInfo] = useState(false);
  const presets: TimelinePreset[] = ['aggressive', 'medium', 'slow'];
  const scenarioKeys = ['techno-optimist', 'baseline', 'disruption-shock'];
  const scenarioLabels: Record<string, string> = {
    'techno-optimist': 'Techno-Optimist',
    'baseline': 'Baseline',
    'disruption-shock': 'Disruption Shock',
  };

  return (
    <div className="w-72 min-w-72 bg-slate-900 border-r border-slate-700/50 p-4 overflow-y-auto h-screen flex flex-col">
      <InfoModal open={showInfo} onClose={() => setShowInfo(false)} />
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h1 className="text-base font-bold text-white">AI Economy Simulator</h1>
          <button
            onClick={() => setShowInfo(true)}
            className="group relative p-0.5 rounded-full text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
            aria-label="How it works"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
              How it works
            </span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">US Labor Market Diffusion Model</p>
      </div>

      <Section title="Timeline">
        <div className="flex gap-1.5">
          {presets.map(p => (
            <button
              key={p}
              onClick={() => onPresetChange(p)}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                params.timelinePreset === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Scenarios">
        <div className="space-y-1.5">
          {scenarioKeys.map(s => (
            <button
              key={s}
              onClick={() => onScenarioLoad(s)}
              className="w-full px-2.5 py-1.5 rounded text-xs text-left bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              {scenarioLabels[s]}
            </button>
          ))}
        </div>
      </Section>

      <Section title="AI Capabilities">
        <Slider
          label="Cognitive Capability"
          value={params.capabilityOverride ?? currentSnapshot.currentModel.capability}
          min={10} max={100} step={1}
          onChange={v => onParamsChange({ capabilityOverride: v })}
        />
        <Slider
          label="Physical / Robotics"
          value={params.physicalCapabilityOverride ?? currentSnapshot.currentModel.physicalCapability}
          min={0} max={100} step={1}
          onChange={v => onParamsChange({ physicalCapabilityOverride: v })}
        />
        <Slider
          label="Reliability"
          value={params.reliabilityOverride ?? currentSnapshot.currentModel.reliability}
          min={0.3} max={0.99} step={0.01}
          onChange={v => onParamsChange({ reliabilityOverride: v })}
          format={v => v.toFixed(2)}
        />
        <button
          onClick={() => onParamsChange({ capabilityOverride: null, physicalCapabilityOverride: null, reliabilityOverride: null })}
          className="text-[10px] text-blue-400 hover:text-blue-300"
        >
          Reset to auto
        </button>
      </Section>

      <Section title="Token Pricing">
        <div className="bg-slate-800/50 rounded p-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Input (per 1M)</span>
            <span className="text-slate-200 font-mono">${currentSnapshot.tokenPriceInput.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Output (per 1M)</span>
            <span className="text-slate-200 font-mono">${currentSnapshot.tokenPriceOutput.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-slate-700 pt-1 mt-1">
            <span className="text-slate-500">AI $/hr equiv</span>
            <span className="text-emerald-400 font-mono font-semibold">${currentSnapshot.aiCostPerHour.toFixed(2)}</span>
          </div>
        </div>
        <Slider
          label="Cost Reduction"
          value={params.costReductionRate}
          min={10} max={60} step={1}
          onChange={v => onParamsChange({ costReductionRate: v })}
          unit="%/yr"
        />
      </Section>

      <Section title="Labor Market" defaultOpen={false}>
        <Slider
          label="New Job Creation Rate"
          value={params.newJobCreationRate}
          min={0.1} max={1.0} step={0.05}
          onChange={v => onParamsChange({ newJobCreationRate: v })}
          format={v => v.toFixed(2)}
        />
        <Slider
          label="New Job Salary"
          value={params.newJobSalaryMultiplier}
          min={0.5} max={1.5} step={0.05}
          onChange={v => onParamsChange({ newJobSalaryMultiplier: v })}
          format={v => `${(v * 100).toFixed(0)}%`}
        />
        <Slider
          label="Retraining Period"
          value={params.retrainingPeriodMonths}
          min={3} max={36} step={1}
          onChange={v => onParamsChange({ retrainingPeriodMonths: v })}
          unit=" mo"
        />
        <Slider
          label="Displacement Threshold"
          value={params.displacementThreshold}
          min={0.2} max={1.0} step={0.05}
          onChange={v => onParamsChange({ displacementThreshold: v })}
          format={v => `${(v * 100).toFixed(0)}%`}
        />
      </Section>

      <div className="mt-auto pt-3 border-t border-slate-700/50">
        <button
          onClick={onReset}
          className="w-full px-3 py-1.5 rounded text-xs bg-slate-800 text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
        >
          Reset Simulation
        </button>
      </div>
    </div>
  );
}
