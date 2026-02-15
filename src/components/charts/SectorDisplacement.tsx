import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MonthSnapshot, JobCategory, IndustrySector } from '../../engine/types';

interface SectorDisplacementProps {
  snapshot: MonthSnapshot;
  jobs: JobCategory[];
}

const SECTOR_COLORS: Record<string, string> = {
  Technology: '#3b82f6',
  Healthcare: '#ef4444',
  Finance: '#f59e0b',
  Manufacturing: '#6366f1',
  Retail: '#ec4899',
  Education: '#10b981',
  Government: '#64748b',
  Transportation: '#f97316',
  Construction: '#a855f7',
  Agriculture: '#84cc16',
  Entertainment: '#e879f9',
  Hospitality: '#fb923c',
  Legal: '#14b8a6',
  Energy: '#facc15',
  'Professional Services': '#06b6d4',
};

export default function SectorDisplacement({ snapshot, jobs }: SectorDisplacementProps) {
  const data = useMemo(() => {
    const sectorMap = new Map<IndustrySector, { total: number; displaced: number }>();

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const state = snapshot.jobStates[i];
      if (!state) continue;
      const existing = sectorMap.get(job.sector) ?? { total: 0, displaced: 0 };
      existing.total += job.workers;
      existing.displaced += state.displacedWorkers;
      sectorMap.set(job.sector, existing);
    }

    return Array.from(sectorMap.entries())
      .map(([sector, { total, displaced }]) => ({
        sector,
        displacedPct: Math.round((displaced / total) * 1000) / 10,
        remainingPct: Math.round(((total - displaced) / total) * 1000) / 10,
        color: SECTOR_COLORS[sector] || '#64748b',
      }))
      .sort((a, b) => b.displacedPct - a.displacedPct);
  }, [snapshot, jobs]);

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Job Displacement by Sector (%)</h3>
      <ResponsiveContainer width="100%" height={Math.max(250, data.length * 28)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis type="category" dataKey="sector" tick={{ fontSize: 10, fill: '#94a3b8' }} width={120} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value: unknown) => `${Number(value).toFixed(1)}%`}
          />
          <Bar dataKey="displacedPct" stackId="a" name="Displaced">
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
          <Bar dataKey="remainingPct" stackId="a" name="Remaining" fill="#334155" fillOpacity={0.4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
