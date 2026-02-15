import React, { useState } from 'react';
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

export default function ControlPanel({ params, currentSnapshot, onParamsChange, onPresetChange, onScenarioLoad, onReset }: ControlPanelProps) {
  const presets: TimelinePreset[] = ['aggressive', 'medium', 'slow'];
  const scenarioKeys = ['techno-optimist', 'baseline', 'disruption-shock'];
  const scenarioLabels: Record<string, string> = {
    'techno-optimist': 'Techno-Optimist',
    'baseline': 'Baseline',
    'disruption-shock': 'Disruption Shock',
  };

  return (
    <div className="w-72 min-w-72 bg-slate-900 border-r border-slate-700/50 p-4 overflow-y-auto h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-base font-bold text-white">AI Economy Simulator</h1>
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
