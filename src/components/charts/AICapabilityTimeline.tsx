import { useMemo } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthSnapshot, AIModel } from '../../engine/types';

interface AICapabilityTimelineProps {
  history: MonthSnapshot[];
  currentMonth: number;
  models: AIModel[];
}

export default function AICapabilityTimeline({ history, currentMonth, models }: AICapabilityTimelineProps) {
  const data = useMemo(() => {
    const sliced = history.slice(0, currentMonth + 1);
    const step = sliced.length > 150 ? Math.ceil(sliced.length / 150) : 1;
    return sliced
      .filter((_, i) => i % step === 0 || i === sliced.length - 1)
      .map(s => {
        const isRelease = models.some(m => m.releaseMonth === s.month);
        return {
          date: s.date,
          month: s.month,
          capability: s.currentModel.capability,
          physical: s.currentModel.physicalCapability,
          costPerHour: s.aiCostPerHour,
          reliability: Math.round(s.currentModel.reliability * 100),
          isRelease,
          tokenInput: s.tokenPriceInput,
        };
      });
  }, [history, currentMonth, models]);

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">AI Model Capability & Cost</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval={Math.max(0, Math.floor(data.length / 8))} />
          <YAxis yAxisId="score" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis yAxisId="cost" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Line yAxisId="score" type="stepAfter" dataKey="capability" stroke="#3b82f6" strokeWidth={2} dot={false} name="Cognitive Capability" />
          <Line yAxisId="score" type="stepAfter" dataKey="physical" stroke="#10b981" strokeWidth={2} dot={false} name="Physical Capability" />
          <Line yAxisId="score" type="stepAfter" dataKey="reliability" stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Reliability (%)" />
          <Line yAxisId="cost" type="monotone" dataKey="costPerHour" stroke="#f59e0b" strokeWidth={2} dot={false} name="Cost ($/hr)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
