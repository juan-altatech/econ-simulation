import { JobCategory, AIModel, SimulationParams, MonthSnapshot, JobState, NewJobCategory } from './types';
import { getCurrentModel, getTokenPrices, getAICostPerHour } from './models';
import { updateJobDisplacement } from './displacement';
import { generateNewJobs, getTotalNewJobWorkers } from './newJobs';
import { calculateEconomics } from './economics';

function monthToDateString(month: number): string {
  const monthNames = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  const m = month % 12;
  const year = 2026 + Math.floor((month + 1) / 12);
  // Feb 2026 = month 0
  // Month 0 -> Feb 2026, Month 1 -> Mar 2026, ... Month 10 -> Dec 2026, Month 11 -> Jan 2027
  return `${monthNames[m]} ${m === 11 ? year : 2026 + Math.floor(month / 12)}`;
}

export function simulateMonth(
  month: number,
  jobs: JobCategory[],
  models: AIModel[],
  params: SimulationParams,
  prevSnapshot: MonthSnapshot | null
): MonthSnapshot {
  const currentModel = getCurrentModel(models, month);

  // Apply overrides
  const effectiveModel: AIModel = {
    ...currentModel,
    capability: params.capabilityOverride ?? currentModel.capability,
    physicalCapability: params.physicalCapabilityOverride ?? currentModel.physicalCapability,
    reliability: params.reliabilityOverride ?? currentModel.reliability,
  };

  const aiCostPerHour = getAICostPerHour(effectiveModel, month, params.costReductionRate);
  const tokenPrices = getTokenPrices(month, params.costReductionRate, params.tokenPriceInputOverride, params.tokenPriceOutputOverride);

  // Previous job states
  const prevJobStates = prevSnapshot?.jobStates ?? [];
  const prevJobStateMap = new Map<string, JobState>();
  for (const js of prevJobStates) {
    prevJobStateMap.set(js.jobId, js);
  }

  // Update each job's displacement
  const jobStates: JobState[] = jobs.map(job =>
    updateJobDisplacement(job, prevJobStateMap.get(job.id), effectiveModel, aiCostPerHour, params.displacementThreshold)
  );

  const totalEmployed = jobStates.reduce((s, js) => s + js.currentWorkers, 0);
  const totalDisplaced = jobStates.reduce((s, js) => s + js.displacedWorkers, 0);
  const totalAugmented = jobStates.reduce((s, js) => s + js.aiAugmentedWorkers, 0);

  // Calculate displacement this month vs previous
  const prevTotalDisplaced = prevSnapshot
    ? prevSnapshot.jobStates.reduce((s, js) => s + js.displacedWorkers, 0)
    : 0;
  const displacedThisMonth = Math.max(0, totalDisplaced - prevTotalDisplaced);

  // Generate new jobs
  const prevNewJobs = prevSnapshot?.newJobs ?? [];
  const newJobs = generateNewJobs(
    month,
    displacedThisMonth,
    totalDisplaced,
    effectiveModel,
    params.newJobCreationRate,
    params.newJobSalaryMultiplier,
    Math.floor(params.retrainingPeriodMonths / 2), // ramp-up delay = half of retraining period
    prevNewJobs
  );

  const totalNewJobWorkers = getTotalNewJobWorkers(newJobs);
  const totalOriginalWorkers = jobs.reduce((s, j) => s + j.workers, 0);

  // Unemployment = displaced - retrained (those who found new jobs)
  // Workers who've been displaced longer than retraining period find new jobs (or new-category jobs)
  const effectiveUnemployed = Math.max(0, totalDisplaced - totalNewJobWorkers * 0.7);
  const unemploymentRate = (effectiveUnemployed / totalOriginalWorkers) * 100;

  const economics = calculateEconomics(
    jobs,
    jobStates,
    newJobs,
    totalEmployed,
    totalDisplaced,
    totalAugmented,
    month,
    params.retrainingPeriodMonths,
    prevSnapshot?.economics
  );

  return {
    month,
    date: monthToDateString(month),
    totalEmployed,
    totalDisplaced,
    totalNewJobs: totalNewJobWorkers,
    totalAugmented,
    unemploymentRate: Math.round(unemploymentRate * 10) / 10,
    jobStates,
    newJobs,
    economics,
    currentModel: effectiveModel,
    tokenPriceInput: tokenPrices.input,
    tokenPriceOutput: tokenPrices.output,
    aiCostPerHour,
  };
}

export function runSimulation(
  months: number,
  jobs: JobCategory[],
  models: AIModel[],
  params: SimulationParams
): MonthSnapshot[] {
  const history: MonthSnapshot[] = [];
  let prev: MonthSnapshot | null = null;

  for (let m = 0; m <= months; m++) {
    const snapshot = simulateMonth(m, jobs, models, params, prev);
    history.push(snapshot);
    prev = snapshot;
  }

  return history;
}
