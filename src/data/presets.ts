import { AIModel, TimelinePreset } from '../engine/types';

interface TimelineConfig {
  releaseIntervalMonths: number;
  capabilityJumpMin: number;
  capabilityJumpMax: number;
  physicalGrowthPerRelease: number;
  costReductionPerYear: number;
  reliabilityGrowthPerRelease: number;
}

const timelineConfigs: Record<TimelinePreset, TimelineConfig> = {
  aggressive: {
    releaseIntervalMonths: 3.5,
    capabilityJumpMin: 8,
    capabilityJumpMax: 12,
    physicalGrowthPerRelease: 4,
    costReductionPerYear: 0.45,
    reliabilityGrowthPerRelease: 0.03,
  },
  medium: {
    releaseIntervalMonths: 5.5,
    capabilityJumpMin: 5,
    capabilityJumpMax: 8,
    physicalGrowthPerRelease: 2.5,
    costReductionPerYear: 0.30,
    reliabilityGrowthPerRelease: 0.02,
  },
  slow: {
    releaseIntervalMonths: 9,
    capabilityJumpMin: 3,
    capabilityJumpMax: 5,
    physicalGrowthPerRelease: 1.5,
    costReductionPerYear: 0.175,
    reliabilityGrowthPerRelease: 0.012,
  },
};

export function generateModelSchedule(preset: TimelinePreset, totalMonths: number = 240): AIModel[] {
  const config = timelineConfigs[preset];
  const models: AIModel[] = [];

  let currentCapability = 55;
  let currentPhysical = 10;
  let currentCost = 8.0;
  let currentReliability = 0.70;
  let month = 0;
  let modelNum = 0;

  // Initial model at month 0
  models.push({
    id: `model-0`,
    name: 'Frontier Model (Feb 2026)',
    releaseMonth: 0,
    capability: currentCapability,
    physicalCapability: currentPhysical,
    costPerHour: currentCost,
    reliability: currentReliability,
  });

  month = Math.round(config.releaseIntervalMonths);

  while (month <= totalMonths) {
    modelNum++;
    const jump = config.capabilityJumpMin + Math.random() * (config.capabilityJumpMax - config.capabilityJumpMin);
    currentCapability = Math.min(100, currentCapability + jump);
    currentPhysical = Math.min(100, currentPhysical + config.physicalGrowthPerRelease);

    // Cost reduces based on time elapsed
    const yearsElapsed = month / 12;
    currentCost = 8.0 * Math.pow(1 - config.costReductionPerYear, yearsElapsed);

    currentReliability = Math.min(0.99, currentReliability + config.reliabilityGrowthPerRelease);

    const year = 2026 + Math.floor((month + 1) / 12);
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(month + 1) % 12];

    models.push({
      id: `model-${modelNum}`,
      name: `Model Gen ${modelNum + 1} (${monthName} ${year})`,
      releaseMonth: month,
      capability: Math.round(currentCapability * 10) / 10,
      physicalCapability: Math.round(currentPhysical * 10) / 10,
      costPerHour: Math.round(currentCost * 100) / 100,
      reliability: Math.round(currentReliability * 1000) / 1000,
    });

    month += Math.round(config.releaseIntervalMonths);
  }

  return models;
}

export function getDefaultCostReductionRate(preset: TimelinePreset): number {
  return timelineConfigs[preset].costReductionPerYear * 100;
}
