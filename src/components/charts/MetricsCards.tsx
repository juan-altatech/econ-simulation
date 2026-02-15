import { MonthSnapshot } from '../../engine/types';

interface MetricsCardsProps {
  snapshot: MonthSnapshot;
  prevSnapshot?: MonthSnapshot;
}

function MetricCard({ label, value, delta, color, sub }: {
  label: string; value: string; delta?: string; color: string; sub?: string;
}) {
  const isPositive = delta?.startsWith('+');
  const isNegative = delta?.startsWith('-');
  return (
    <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/30">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
      {delta && (
        <div className={`text-[11px] font-mono mt-0.5 ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-500'}`}>
          {delta}
        </div>
      )}
      {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function fmt(n: number, decimals = 1): string {
  if (n >= 1e6) return (n / 1e6).toFixed(decimals) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(decimals) + 'K';
  return n.toFixed(decimals);
}

export default function MetricsCards({ snapshot, prevSnapshot }: MetricsCardsProps) {
  const totalOriginal = snapshot.jobStates.reduce((s, j) => s + j.currentWorkers + j.displacedWorkers, 0);
  const totalWorkforce = totalOriginal + snapshot.totalNewJobs;

  const prevEmployed = prevSnapshot
    ? prevSnapshot.totalEmployed + prevSnapshot.totalNewJobs
    : snapshot.totalEmployed + snapshot.totalNewJobs;
  const currentEmployed = snapshot.totalEmployed + snapshot.totalNewJobs;
  const employedDelta = currentEmployed - prevEmployed;

  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
      <MetricCard
        label="Employment"
        value={`${currentEmployed.toFixed(1)}M`}
        delta={employedDelta !== 0 ? `${employedDelta > 0 ? '+' : ''}${employedDelta.toFixed(2)}M` : undefined}
        color="text-white"
        sub={`of ${totalOriginal.toFixed(1)}M original`}
      />
      <MetricCard
        label="Unemployment"
        value={`${snapshot.unemploymentRate.toFixed(1)}%`}
        color={snapshot.unemploymentRate > 10 ? 'text-red-400' : snapshot.unemploymentRate > 6 ? 'text-amber-400' : 'text-emerald-400'}
      />
      <MetricCard
        label="GDP"
        value={`$${snapshot.economics.totalGDP.toFixed(1)}T`}
        color="text-blue-400"
        sub={`${((snapshot.economics.totalGDP / 28 - 1) * 100).toFixed(1)}% vs baseline`}
      />
      <MetricCard
        label="AI Cost/hr"
        value={`$${snapshot.aiCostPerHour.toFixed(2)}`}
        color="text-emerald-400"
      />
      <MetricCard
        label="New Jobs"
        value={`${snapshot.totalNewJobs.toFixed(2)}M`}
        color="text-violet-400"
        sub="AI-era roles"
      />
      <MetricCard
        label="AI Capability"
        value={`${snapshot.currentModel.capability.toFixed(0)}`}
        color="text-cyan-400"
        sub={`Physical: ${snapshot.currentModel.physicalCapability.toFixed(0)}`}
      />
      <MetricCard
        label="Corp. Profits"
        value={`${snapshot.economics.corporateProfitIndex.toFixed(0)}`}
        color="text-amber-400"
        sub="Index (100 = baseline)"
      />
      <MetricCard
        label="Safety Net"
        value={`$${snapshot.economics.governmentSpending.toFixed(2)}T`}
        color="text-orange-400"
        sub="Gov. spending"
      />
    </div>
  );
}
