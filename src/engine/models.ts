import { AIModel } from './types';

export function getCurrentModel(models: AIModel[], month: number): AIModel {
  let current = models[0];
  for (const model of models) {
    if (model.releaseMonth <= month) {
      current = model;
    } else {
      break;
    }
  }
  return current;
}

export function getTokenPrices(month: number, costReductionRate: number, inputOverride: number | null, outputOverride: number | null) {
  const basePriceInput = 1.0; // $/1M tokens
  const basePriceOutput = 3.0;
  const annualReduction = costReductionRate / 100;
  const years = month / 12;
  const factor = Math.pow(1 - annualReduction, years);

  return {
    input: inputOverride ?? Math.round(basePriceInput * factor * 1000) / 1000,
    output: outputOverride ?? Math.round(basePriceOutput * factor * 1000) / 1000,
  };
}

export function getAICostPerHour(model: AIModel, month: number, costReductionRate: number): number {
  const annualReduction = costReductionRate / 100;
  const years = month / 12;
  // Cost from the model schedule, further reduced by time since model release
  const monthsSinceRelease = month - model.releaseMonth;
  const additionalReduction = Math.pow(1 - annualReduction, monthsSinceRelease / 12);
  return Math.round(model.costPerHour * additionalReduction * 100) / 100;
}
