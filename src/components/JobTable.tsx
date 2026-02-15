import { useState, useMemo } from 'react';
import { JobCategory, MonthSnapshot, JobState } from '../engine/types';
import ChartHeader from './ChartHeader';

interface JobTableProps {
  jobs: JobCategory[];
  snapshot: MonthSnapshot;
}

type SortKey = 'title' | 'workers' | 'displaced' | 'salary' | 'sector' | 'level' | 'cognitive';
type SortDir = 'asc' | 'desc';

function getStatusColor(state: JobState, job: JobCategory): string {
  if (state.displacementPercent > 0.5) return 'bg-slate-600/30 text-slate-500'; // mostly displaced
  if (state.displacementPercent > 0.1) return 'bg-red-900/20 text-red-300'; // actively being displaced
  if (state.displacementEligible) return 'bg-amber-900/20 text-amber-300'; // at risk
  return 'bg-emerald-900/10 text-emerald-300'; // safe
}

function getStatusLabel(state: JobState): string {
  if (state.displacementPercent > 0.5) return 'Mostly Displaced';
  if (state.displacementPercent > 0.1) return 'Displacing';
  if (state.displacementEligible) return 'At Risk';
  return 'Safe';
}

export default function JobTable({ jobs, snapshot }: JobTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('displaced');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedJobs = useMemo(() => {
    const stateMap = new Map<string, JobState>();
    for (const js of snapshot.jobStates) {
      stateMap.set(js.jobId, js);
    }

    const items = jobs.map(job => ({
      job,
      state: stateMap.get(job.id)!,
    }));

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'title': cmp = a.job.title.localeCompare(b.job.title); break;
        case 'workers': cmp = a.state.currentWorkers - b.state.currentWorkers; break;
        case 'displaced': cmp = a.state.displacementPercent - b.state.displacementPercent; break;
        case 'salary': cmp = a.job.medianSalary - b.job.medianSalary; break;
        case 'sector': cmp = a.job.sector.localeCompare(b.job.sector); break;
        case 'level': cmp = a.job.level.localeCompare(b.job.level); break;
        case 'cognitive': cmp = a.job.cognitiveComplexity - b.job.cognitiveComplexity; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return items;
  }, [jobs, snapshot, sortKey, sortDir]);

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      onClick={() => toggleSort(field)}
      className="px-2 py-2 text-left text-[10px] uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-300 select-none"
    >
      {label} {sortKey === field ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
      <ChartHeader
        title="Job Categories"
        tooltip="Detailed breakdown of all 50 modeled job categories. Click column headers to sort. The % Displaced column shows the S-curve displacement progress for each job. Status colors: green = safe (AI can't yet do this job affordably), yellow = at risk (displacement conditions are met, early adoption phase), red = actively displacing, gray = mostly displaced. Cognitive score determines when AI becomes capable; physical score and human interaction act as drag factors that slow displacement even when AI is technically capable."
      />
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-800 z-10">
            <tr>
              <SortHeader label="Job" field="title" />
              <SortHeader label="Workers (M)" field="workers" />
              <SortHeader label="% Displaced" field="displaced" />
              <SortHeader label="Salary" field="salary" />
              <SortHeader label="Cognitive" field="cognitive" />
              <SortHeader label="Sector" field="sector" />
              <SortHeader label="Level" field="level" />
              <th className="px-2 py-2 text-left text-[10px] uppercase tracking-wider text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map(({ job, state }) => (
              <tr
                key={job.id}
                onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                className={`border-t border-slate-700/30 cursor-pointer transition-colors ${
                  selectedJobId === job.id ? 'bg-slate-700/30' : 'hover:bg-slate-700/20'
                } ${getStatusColor(state, job)}`}
              >
                <td className="px-2 py-1.5 font-medium whitespace-nowrap">{job.title}</td>
                <td className="px-2 py-1.5 font-mono">{state.currentWorkers.toFixed(2)}</td>
                <td className="px-2 py-1.5 font-mono">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${Math.min(100, state.displacementPercent * 100)}%` }}
                      />
                    </div>
                    {(state.displacementPercent * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="px-2 py-1.5 font-mono">${(job.medianSalary / 1000).toFixed(0)}K</td>
                <td className="px-2 py-1.5 font-mono">{job.cognitiveComplexity}</td>
                <td className="px-2 py-1.5 whitespace-nowrap">{job.sector}</td>
                <td className="px-2 py-1.5">{job.level}</td>
                <td className="px-2 py-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    state.displacementPercent > 0.5 ? 'bg-slate-600/40 text-slate-400' :
                    state.displacementPercent > 0.1 ? 'bg-red-500/20 text-red-400' :
                    state.displacementEligible ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {getStatusLabel(state)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New AI-Era Jobs section */}
      {snapshot.newJobs.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700/30">
          <h4 className="text-xs font-semibold text-violet-400 mb-2">Projected New AI-Era Roles</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
            {snapshot.newJobs.map(nj => (
              <div key={nj.id} className="bg-violet-900/15 rounded px-2 py-1.5 text-[11px]">
                <div className="text-violet-300 font-medium">{nj.title}</div>
                <div className="text-slate-500">{nj.workers.toFixed(3)}M · ${(nj.averageSalary / 1000).toFixed(0)}K</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
