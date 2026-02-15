export type JobLevel = 'Entry' | 'Mid' | 'Senior' | 'Expert';

export type IndustrySector =
  | 'Technology'
  | 'Healthcare'
  | 'Finance'
  | 'Manufacturing'
  | 'Retail'
  | 'Education'
  | 'Government'
  | 'Transportation'
  | 'Construction'
  | 'Agriculture'
  | 'Entertainment'
  | 'Hospitality'
  | 'Legal'
  | 'Energy'
  | 'Professional Services';

export interface JobCategory {
  id: string;
  title: string;
  workers: number; // in millions
  medianSalary: number;
  cognitiveComplexity: number; // 1-100
  physicalRequirement: number; // 1-100
  routineScore: number; // 1-100
  humanInteraction: number; // 1-100
  sector: IndustrySector;
  level: JobLevel;
}

export interface AIModel {
  id: string;
  name: string;
  releaseMonth: number; // months from simulation start (0 = Feb 2026)
  capability: number; // 1-100
  physicalCapability: number; // 1-100
  costPerHour: number; // $/hr equivalent
  reliability: number; // 0-1
}

export interface JobState {
  jobId: string;
  currentWorkers: number; // millions
  displacedWorkers: number;
  aiAugmentedWorkers: number;
  displacementEligible: boolean;
  monthsSinceEligible: number;
  displacementPercent: number;
}

export interface NewJobCategory {
  id: string;
  title: string;
  type: 'ai-adjacent' | 'new-category' | 'human-premium' | 'oversight';
  workers: number;
  averageSalary: number;
  createdAtMonth: number;
  cognitiveComplexity: number;
}

export interface EconomicState {
  gdpHumanLabor: number; // trillions
  gdpAugmentedLabor: number;
  gdpAIOnly: number;
  totalGDP: number;
  taxRevenue: number; // trillions
  consumerSpendingIndex: number; // 100 = baseline
  corporateProfitIndex: number; // 100 = baseline
  governmentSpending: number; // trillions on safety net
  giniCoefficient: number;
  medianIncome: number;
  income10th: number;
  income25th: number;
  income75th: number;
  income90th: number;
  productivityMultiplier: number;
}

export interface MonthSnapshot {
  month: number; // 0 = Feb 2026
  date: string; // "Feb 2026"
  totalEmployed: number;
  totalDisplaced: number;
  totalNewJobs: number;
  totalAugmented: number;
  unemploymentRate: number;
  jobStates: JobState[];
  newJobs: NewJobCategory[];
  economics: EconomicState;
  currentModel: AIModel;
  tokenPriceInput: number; // per 1M tokens
  tokenPriceOutput: number;
  aiCostPerHour: number;
}

export type TimelinePreset = 'aggressive' | 'medium' | 'slow';

export interface SimulationParams {
  timelinePreset: TimelinePreset;
  newJobCreationRate: number; // 0.1 - 1.0
  newJobSalaryMultiplier: number; // 0.5 - 1.5
  retrainingPeriodMonths: number; // 3 - 36
  displacementThreshold: number; // 0.2 - 1.0
  costReductionRate: number; // % per year, 10-60
  tokenPriceInputOverride: number | null;
  tokenPriceOutputOverride: number | null;
  capabilityOverride: number | null;
  physicalCapabilityOverride: number | null;
  reliabilityOverride: number | null;
}

export type ScenarioName = 'techno-optimist' | 'baseline' | 'disruption-shock';

export interface Scenario {
  name: string;
  description: string;
  params: SimulationParams;
}

export interface SimulationState {
  currentMonth: number;
  isPlaying: boolean;
  speed: number; // months per second
  params: SimulationParams;
  history: MonthSnapshot[];
  jobs: JobCategory[];
  models: AIModel[];
}
