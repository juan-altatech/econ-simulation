import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MonthSnapshot, AIModel } from '../../engine/types';

interface EmploymentChartProps {
  history: MonthSnapshot[];
  currentMonth: number;
  models: AIModel[];
}

export default function EmploymentChart({ history, currentMonth, models }: EmploymentChartProps) {
  const data = useMemo(() => {
    const sliced = history.slice(0, currentMonth + 1);
    // Sample if too many points
    const step = sliced.length > 200 ? Math.ceil(sliced.length / 200) : 1;
    const sampled = sliced.filter((_, i) => i % step === 0 || i === sliced.length - 1);

    return sampled.map(s => ({
      month: s.month,
      date: s.date,
      employed: Math.round((s.totalEmployed - s.totalAugmented) * 100) / 100,
      augmented: Math.round(s.totalAugmented * 100) / 100,
      newJobs: Math.round(s.totalNewJobs * 100) / 100,
      displaced: Math.round(s.totalDisplaced * 100) / 100,
    }));
  }, [history, currentMonth]);

  const modelReleases = useMemo(
    () => models.filter(m => m.releaseMonth > 0 && m.releaseMonth <= currentMonth),
    [models, currentMonth]
  );

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Employment Over Time (Millions)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#64748b' }}
            interval={Math.max(0, Math.floor(data.length / 8))}
          />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          {modelReleases.map(m => (
            <ReferenceLine
              key={m.id}
              x={data.find(d => d.month >= m.releaseMonth)?.date}
              stroke="#475569"
              strokeDasharray="3 3"
              label={{ value: '', position: 'top' }}
            />
          ))}
          <Area type="monotone" dataKey="employed" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Human Workers" />
          <Area type="monotone" dataKey="augmented" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} name="AI-Augmented" />
          <Area type="monotone" dataKey="newJobs" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="New AI-Era Jobs" />
          <Area type="monotone" dataKey="displaced" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Displaced" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
