import { useMemo } from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { MonthSnapshot } from '../../engine/types';

interface GDPChartProps {
  history: MonthSnapshot[];
  currentMonth: number;
}

export default function GDPChart({ history, currentMonth }: GDPChartProps) {
  const data = useMemo(() => {
    const sliced = history.slice(0, currentMonth + 1);
    const step = sliced.length > 200 ? Math.ceil(sliced.length / 200) : 1;
    return sliced
      .filter((_, i) => i % step === 0 || i === sliced.length - 1)
      .map(s => ({
        date: s.date,
        humanLabor: Math.round(s.economics.gdpHumanLabor * 10) / 10,
        augmentedLabor: Math.round(s.economics.gdpAugmentedLabor * 10) / 10,
        aiOnly: Math.round(s.economics.gdpAIOnly * 10) / 10,
        totalGDP: Math.round(s.economics.totalGDP * 10) / 10,
      }));
  }, [history, currentMonth]);

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">GDP Composition ($ Trillions)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval={Math.max(0, Math.floor(data.length / 8))} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Area type="monotone" dataKey="humanLabor" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} name="Human Labor" />
          <Area type="monotone" dataKey="augmentedLabor" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} name="AI-Augmented Labor" />
          <Area type="monotone" dataKey="aiOnly" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.5} name="AI-Only Output" />
          <Line type="monotone" dataKey="totalGDP" stroke="#f59e0b" strokeWidth={2} dot={false} name="Total GDP" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
