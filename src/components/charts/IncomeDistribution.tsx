import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthSnapshot } from '../../engine/types';
import ChartHeader from '../ChartHeader';

interface IncomeDistributionProps {
  history: MonthSnapshot[];
  currentMonth: number;
}

export default function IncomeDistribution({ history, currentMonth }: IncomeDistributionProps) {
  const data = useMemo(() => {
    const sliced = history.slice(0, currentMonth + 1);
    const step = sliced.length > 150 ? Math.ceil(sliced.length / 150) : 1;
    return sliced
      .filter((_, i) => i % step === 0 || i === sliced.length - 1)
      .map(s => ({
        date: s.date,
        p10: Math.round(s.economics.income10th / 1000),
        p25: Math.round(s.economics.income25th / 1000),
        median: Math.round(s.economics.medianIncome / 1000),
        p75: Math.round(s.economics.income75th / 1000),
        p90: Math.round(s.economics.income90th / 1000),
        gini: Math.round(s.economics.giniCoefficient * 100) / 100,
      }));
  }, [history, currentMonth]);

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
      <ChartHeader
        title="Income Distribution ($K) & Gini"
        tooltip="Tracks income across the population over time. The five lines show the 10th, 25th, 50th (median), 75th, and 90th income percentiles in thousands of dollars. The dashed orange line is the Gini coefficient (right axis, 0 = perfect equality, 1 = perfect inequality). As AI displaces lower-wage jobs first, inequality tends to rise — but new jobs and augmentation effects can moderate this depending on your parameter settings."
      />
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} interval={Math.max(0, Math.floor(data.length / 8))} />
          <YAxis yAxisId="income" tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis yAxisId="gini" orientation="right" domain={[0.2, 0.7]} tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Line yAxisId="income" type="monotone" dataKey="p90" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="90th %ile ($K)" />
          <Line yAxisId="income" type="monotone" dataKey="p75" stroke="#22c55e" strokeWidth={1.5} dot={false} name="75th %ile ($K)" />
          <Line yAxisId="income" type="monotone" dataKey="median" stroke="#3b82f6" strokeWidth={2} dot={false} name="Median ($K)" />
          <Line yAxisId="income" type="monotone" dataKey="p25" stroke="#a855f7" strokeWidth={1.5} dot={false} name="25th %ile ($K)" />
          <Line yAxisId="income" type="monotone" dataKey="p10" stroke="#ef4444" strokeWidth={1.5} dot={false} name="10th %ile ($K)" />
          <Line yAxisId="gini" type="monotone" dataKey="gini" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Gini Coefficient" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
