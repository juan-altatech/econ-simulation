import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthSnapshot } from '../../engine/types';

interface CompoundingEffectsProps {
  history: MonthSnapshot[];
  currentMonth: number;
}

export default function CompoundingEffects({ history, currentMonth }: CompoundingEffectsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const data = useMemo(() => {
    const sliced = history.slice(0, currentMonth + 1);
    const step = sliced.length > 150 ? Math.ceil(sliced.length / 150) : 1;
    return sliced
      .filter((_, i) => i % step === 0 || i === sliced.length - 1)
      .map(s => ({
        date: s.date,
        taxRevenue: Math.round(s.economics.taxRevenue * 100) / 100,
        consumerSpending: Math.round(s.economics.consumerSpendingIndex * 10) / 10,
        productivity: Math.round(s.economics.productivityMultiplier * 100) / 100,
        inequality: Math.round(s.economics.giniCoefficient * 1000) / 1000,
        govSpending: Math.round(s.economics.governmentSpending * 100) / 100,
      }));
  }, [history, currentMonth]);

  const latest = history[currentMonth] ?? history[history.length - 1];

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm font-semibold text-slate-300 mb-2"
      >
        Compounding Effects
        <span className="text-xs text-slate-500">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <div className="bg-slate-900/50 rounded p-2">
              <div className="text-[10px] text-slate-500 uppercase">Tax Revenue</div>
              <div className="text-sm font-mono text-blue-400">${latest.economics.taxRevenue.toFixed(2)}T</div>
            </div>
            <div className="bg-slate-900/50 rounded p-2">
              <div className="text-[10px] text-slate-500 uppercase">Consumer Spending</div>
              <div className="text-sm font-mono text-emerald-400">{latest.economics.consumerSpendingIndex.toFixed(1)}</div>
            </div>
            <div className="bg-slate-900/50 rounded p-2">
              <div className="text-[10px] text-slate-500 uppercase">Productivity</div>
              <div className="text-sm font-mono text-amber-400">{latest.economics.productivityMultiplier.toFixed(2)}x</div>
            </div>
            <div className="bg-slate-900/50 rounded p-2">
              <div className="text-[10px] text-slate-500 uppercase">Inequality (Gini)</div>
              <div className="text-sm font-mono text-red-400">{latest.economics.giniCoefficient.toFixed(3)}</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval={Math.max(0, Math.floor(data.length / 8))} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line yAxisId="left" type="monotone" dataKey="taxRevenue" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Tax Revenue ($T)" />
              <Line yAxisId="left" type="monotone" dataKey="govSpending" stroke="#f97316" strokeWidth={1.5} dot={false} name="Gov. Spending ($T)" />
              <Line yAxisId="right" type="monotone" dataKey="consumerSpending" stroke="#10b981" strokeWidth={1.5} dot={false} name="Consumer Index" />
              <Line yAxisId="right" type="monotone" dataKey="productivity" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Productivity (x)" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
