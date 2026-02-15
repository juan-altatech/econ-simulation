import { Scenario, SimulationParams } from '../engine/types';

export const defaultParams: SimulationParams = {
  timelinePreset: 'medium',
  newJobCreationRate: 0.4,
  newJobSalaryMultiplier: 0.85,
  retrainingPeriodMonths: 12,
  displacementThreshold: 0.5,
  costReductionRate: 30,
  tokenPriceInputOverride: null,
  tokenPriceOutputOverride: null,
  capabilityOverride: null,
  physicalCapabilityOverride: null,
  reliabilityOverride: null,
};

export const scenarios: Record<string, Scenario> = {
  'techno-optimist': {
    name: 'Techno-Optimist',
    description: 'Aggressive AI progress with high job creation and fast worker retraining',
    params: {
      timelinePreset: 'aggressive',
      newJobCreationRate: 0.8,
      newJobSalaryMultiplier: 1.1,
      retrainingPeriodMonths: 6,
      displacementThreshold: 0.5,
      costReductionRate: 45,
      tokenPriceInputOverride: null,
      tokenPriceOutputOverride: null,
      capabilityOverride: null,
      physicalCapabilityOverride: null,
      reliabilityOverride: null,
    },
  },
  baseline: {
    name: 'Baseline',
    description: 'Medium-paced AI progress with moderate job creation',
    params: { ...defaultParams },
  },
  'disruption-shock': {
    name: 'Disruption Shock',
    description: 'Aggressive AI with low job creation and slow retraining',
    params: {
      timelinePreset: 'aggressive',
      newJobCreationRate: 0.2,
      newJobSalaryMultiplier: 0.65,
      retrainingPeriodMonths: 24,
      displacementThreshold: 0.4,
      costReductionRate: 45,
      tokenPriceInputOverride: null,
      tokenPriceOutputOverride: null,
      capabilityOverride: null,
      physicalCapabilityOverride: null,
      reliabilityOverride: null,
    },
  },
};
