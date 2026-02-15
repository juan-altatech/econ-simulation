import { AIModel, JobCategory, JobState } from './types';

function reliabilityFloor(job: JobCategory): number {
  switch (job.sector) {
    case 'Healthcare': return 0.95;
    case 'Finance': return 0.90;
    case 'Legal': return 0.92;
    case 'Government': return 0.90;
    case 'Transportation': return 0.88;
    case 'Education': return 0.85;
    default: return 0.60;
  }
}

export function checkDisplacementEligibility(
  job: JobCategory,
  model: AIModel,
  aiCostPerHour: number,
  displacementThreshold: number
): boolean {
  const hourlySalary = job.medianSalary / 2080;

  return (
    model.capability >= job.cognitiveComplexity &&
    model.physicalCapability >= job.physicalRequirement * 0.5 &&
    aiCostPerHour < hourlySalary * displacementThreshold &&
    model.reliability >= reliabilityFloor(job)
  );
}

// Logistic S-curve for displacement progression
function sCurve(monthsSinceEligible: number, humanInteraction: number): number {
  // Drag factor from human interaction
  const dragFactor = 1 - humanInteraction / 200;
  // Effective months considering drag
  const effectiveMonths = monthsSinceEligible * dragFactor;

  // Asymptotic limit: jobs with high human interaction retain more workers
  const maxDisplacement = 1 - (humanInteraction / 100) * 0.25 - 0.05;

  // S-curve: slow start, accelerate, then plateau
  // Midpoint at ~18 months, steepness 0.15
  const k = 0.15;
  const midpoint = 18;
  const raw = 1 / (1 + Math.exp(-k * (effectiveMonths - midpoint)));

  return Math.min(maxDisplacement, raw * maxDisplacement);
}

export function updateJobDisplacement(
  job: JobCategory,
  prevState: JobState | undefined,
  model: AIModel,
  aiCostPerHour: number,
  displacementThreshold: number
): JobState {
  const eligible = checkDisplacementEligibility(job, model, aiCostPerHour, displacementThreshold);

  const prev: JobState = prevState ?? {
    jobId: job.id,
    currentWorkers: job.workers,
    displacedWorkers: 0,
    aiAugmentedWorkers: 0,
    displacementEligible: false,
    monthsSinceEligible: 0,
    displacementPercent: 0,
  };

  let monthsSinceEligible = prev.monthsSinceEligible;
  if (eligible) {
    if (!prev.displacementEligible) {
      monthsSinceEligible = 1;
    } else {
      monthsSinceEligible = prev.monthsSinceEligible + 1;
    }
  }

  const displacementPercent = eligible
    ? sCurve(monthsSinceEligible, job.humanInteraction)
    : prev.displacementPercent; // don't reverse displacement

  const displacedWorkers = job.workers * displacementPercent;
  const remainingWorkers = job.workers - displacedWorkers;

  // AI augmentation: workers who aren't displaced but use AI to be more productive
  // This happens when AI capability is within ~20 points of the job's cognitive complexity
  const augmentationEligible =
    model.capability >= job.cognitiveComplexity * 0.6 &&
    model.capability < job.cognitiveComplexity + 20;
  const augmentedFraction = augmentationEligible
    ? Math.min(0.7, (model.capability - job.cognitiveComplexity * 0.6) / (job.cognitiveComplexity * 0.4 + 20) * 0.7)
    : eligible
      ? 0.3 // even displaced-eligible jobs have some augmented workers
      : 0;
  const aiAugmentedWorkers = remainingWorkers * Math.max(0, augmentedFraction);

  return {
    jobId: job.id,
    currentWorkers: remainingWorkers,
    displacedWorkers,
    aiAugmentedWorkers,
    displacementEligible: eligible || prev.displacementEligible,
    monthsSinceEligible,
    displacementPercent,
  };
}
