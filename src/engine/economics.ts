import { EconomicState, JobCategory, JobState, NewJobCategory } from './types';

const BASELINE_GDP = 28.0; // trillions, ~US GDP 2025
const BASELINE_TOTAL_WORKERS = 160; // millions
const BASELINE_TAX_RATE = 0.18;
const BASELINE_GINI = 0.39;
const BASELINE_MEDIAN_INCOME = 60000;

export function calculateEconomics(
  jobs: JobCategory[],
  jobStates: JobState[],
  newJobs: NewJobCategory[],
  totalEmployed: number,
  totalDisplaced: number,
  totalAugmented: number,
  month: number,
  retrainingPeriodMonths: number,
  prevEconomics?: EconomicState
): EconomicState {
  const totalOriginalWorkers = jobs.reduce((s, j) => s + j.workers, 0);

  // Calculate wage income from remaining human workers
  // Note: worker counts are in millions, so multiply by 1e6 for actual headcount
  let humanWageIncome = 0;
  let augmentedWageIncome = 0;
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const state = jobStates[i];
    if (!state) continue;
    const pureHumanWorkers = state.currentWorkers - state.aiAugmentedWorkers;
    humanWageIncome += pureHumanWorkers * 1e6 * job.medianSalary;

    // Augmented workers are more productive, some of that shows up as higher wages
    const productivityBoost = 1.5; // augmented workers are 1.5x as productive
    augmentedWageIncome += state.aiAugmentedWorkers * 1e6 * job.medianSalary * productivityBoost;
  }

  // New job income
  let newJobIncome = 0;
  for (const nj of newJobs) {
    newJobIncome += nj.workers * 1e6 * nj.averageSalary;
  }

  // GDP calculations
  const humanLaborGDP = (humanWageIncome / 1e12) * 2.0; // rough multiplier from wages to GDP contribution
  const augmentedLaborGDP = (augmentedWageIncome / 1e12) * 2.2; // augmented workers have higher multiplier
  const newJobGDP = (newJobIncome / 1e12) * 2.0;

  // AI-only GDP: grows as displacement increases (AI doing work without humans)
  const displacedFraction = totalDisplaced / totalOriginalWorkers;
  const aiOnlyGDP = BASELINE_GDP * displacedFraction * 0.6; // AI does 60% of the value humans did, at lower cost

  const totalGDP = humanLaborGDP + augmentedLaborGDP + newJobGDP + aiOnlyGDP;

  // Tax revenue
  const totalWageIncome = humanWageIncome + augmentedWageIncome + newJobIncome;
  const taxRevenue = (totalWageIncome / 1e12) * BASELINE_TAX_RATE + aiOnlyGDP * 0.10; // assume some AI tax/corporate tax

  // Consumer spending (indexed to 100)
  const employmentRatio = (totalEmployed + newJobs.reduce((s, j) => s + j.workers, 0)) / totalOriginalWorkers;
  const consumerSpendingIndex = Math.max(60, employmentRatio * 100 + (totalAugmented / totalOriginalWorkers) * 15);

  // Corporate profits surge as AI reduces labor costs
  const laborCostSavings = displacedFraction * 100 * 0.4; // 40% of savings flow to profits
  const corporateProfitIndex = 100 + laborCostSavings + (totalAugmented / totalOriginalWorkers) * 20;

  // Government spending on safety net
  const unemploymentBenefitPerWorker = 25000; // annual
  // Workers in retraining period
  const workersOnBenefits = Math.min(totalDisplaced, totalDisplaced * Math.min(1, retrainingPeriodMonths / 12));
  const governmentSpending = (workersOnBenefits * 1e6 * unemploymentBenefitPerWorker) / 1e12 + 0.5; // 0.5T baseline

  // Income distribution
  // As displacement increases, inequality grows (initially)
  // Then new jobs can reduce it somewhat
  const newJobFraction = newJobs.reduce((s, j) => s + j.workers, 0) / totalOriginalWorkers;
  const inequalityPressure = displacedFraction * 0.15 - newJobFraction * 0.05;
  const giniCoefficient = Math.min(0.65, Math.max(0.30, BASELINE_GINI + inequalityPressure));

  // Income percentiles
  const displacementEffect = 1 - displacedFraction * 0.3;
  const augmentationEffect = 1 + (totalAugmented / totalOriginalWorkers) * 0.2;

  const medianIncome = BASELINE_MEDIAN_INCOME * displacementEffect * augmentationEffect;
  const income10th = 22000 * (1 - displacedFraction * 0.5);
  const income25th = 35000 * (1 - displacedFraction * 0.35) * augmentationEffect * 0.9;
  const income75th = 95000 * augmentationEffect;
  const income90th = 155000 * augmentationEffect * (1 + displacedFraction * 0.1); // top earners benefit more

  // Productivity multiplier (economy-wide)
  const productivityMultiplier = 1 + (totalAugmented / totalOriginalWorkers) * 0.8 + displacedFraction * 0.3;

  return {
    gdpHumanLabor: Math.round(humanLaborGDP * 100) / 100,
    gdpAugmentedLabor: Math.round((augmentedLaborGDP + newJobGDP) * 100) / 100,
    gdpAIOnly: Math.round(aiOnlyGDP * 100) / 100,
    totalGDP: Math.round(totalGDP * 100) / 100,
    taxRevenue: Math.round(taxRevenue * 100) / 100,
    consumerSpendingIndex: Math.round(consumerSpendingIndex * 10) / 10,
    corporateProfitIndex: Math.round(corporateProfitIndex * 10) / 10,
    governmentSpending: Math.round(governmentSpending * 100) / 100,
    giniCoefficient: Math.round(giniCoefficient * 1000) / 1000,
    medianIncome: Math.round(medianIncome),
    income10th: Math.round(income10th),
    income25th: Math.round(income25th),
    income75th: Math.round(income75th),
    income90th: Math.round(income90th),
    productivityMultiplier: Math.round(productivityMultiplier * 100) / 100,
  };
}
