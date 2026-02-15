import { NewJobCategory, AIModel } from './types';

const NEW_JOB_TEMPLATES: Array<{
  titlePattern: string;
  type: NewJobCategory['type'];
  salaryMultiplier: number;
  complexityOffset: number;
}> = [
  // AI-adjacent
  { titlePattern: 'AI Training Specialist', type: 'ai-adjacent', salaryMultiplier: 0.9, complexityOffset: 5 },
  { titlePattern: 'Prompt Engineer', type: 'ai-adjacent', salaryMultiplier: 1.1, complexityOffset: 8 },
  { titlePattern: 'AI Auditor', type: 'ai-adjacent', salaryMultiplier: 1.0, complexityOffset: 10 },
  { titlePattern: 'Human-AI Collaboration Designer', type: 'ai-adjacent', salaryMultiplier: 1.15, complexityOffset: 12 },
  { titlePattern: 'AI Systems Monitor', type: 'ai-adjacent', salaryMultiplier: 0.8, complexityOffset: 3 },

  // New category
  { titlePattern: 'Experience Designer', type: 'new-category', salaryMultiplier: 1.0, complexityOffset: 15 },
  { titlePattern: 'AI-Enhanced Services Coordinator', type: 'new-category', salaryMultiplier: 0.85, complexityOffset: 7 },
  { titlePattern: 'Digital Twin Manager', type: 'new-category', salaryMultiplier: 1.05, complexityOffset: 10 },
  { titlePattern: 'Synthetic Media Producer', type: 'new-category', salaryMultiplier: 0.95, complexityOffset: 12 },
  { titlePattern: 'AI Integration Specialist', type: 'new-category', salaryMultiplier: 1.0, complexityOffset: 8 },

  // Human premium
  { titlePattern: 'Artisanal Craftsperson', type: 'human-premium', salaryMultiplier: 0.7, complexityOffset: 5 },
  { titlePattern: 'Human-Certified Educator', type: 'human-premium', salaryMultiplier: 0.9, complexityOffset: 8 },
  { titlePattern: 'Personal Wellness Guide', type: 'human-premium', salaryMultiplier: 0.8, complexityOffset: 6 },
  { titlePattern: 'Authentic Experience Host', type: 'human-premium', salaryMultiplier: 0.75, complexityOffset: 4 },
  { titlePattern: 'Human Companionship Professional', type: 'human-premium', salaryMultiplier: 0.7, complexityOffset: 3 },

  // Oversight & governance
  { titlePattern: 'AI Ethics Compliance Officer', type: 'oversight', salaryMultiplier: 1.1, complexityOffset: 12 },
  { titlePattern: 'Algorithmic Fairness Auditor', type: 'oversight', salaryMultiplier: 1.15, complexityOffset: 15 },
  { titlePattern: 'AI Regulation Specialist', type: 'oversight', salaryMultiplier: 1.05, complexityOffset: 10 },
  { titlePattern: 'Transition Support Counselor', type: 'oversight', salaryMultiplier: 0.85, complexityOffset: 7 },
  { titlePattern: 'AI Safety Researcher', type: 'oversight', salaryMultiplier: 1.2, complexityOffset: 18 },
];

export function generateNewJobs(
  month: number,
  totalDisplacedThisMonth: number,
  cumulativeDisplaced: number,
  currentModel: AIModel,
  creationRate: number,
  salaryMultiplier: number,
  rampUpDelay: number,
  existingNewJobs: NewJobCategory[]
): NewJobCategory[] {
  // No new jobs until ramp-up delay after displacement begins
  if (cumulativeDisplaced < 0.01) return [...existingNewJobs];

  // Find the month displacement first became significant
  const monthsSinceSignificantDisplacement = month; // simplified

  if (monthsSinceSignificantDisplacement < rampUpDelay && existingNewJobs.length === 0) {
    return [...existingNewJobs];
  }

  const updated = existingNewJobs.map(j => ({ ...j }));

  // How many new workers to create this month
  const newWorkersThisMonth = totalDisplacedThisMonth * creationRate;

  if (newWorkersThisMonth < 0.001) return updated;

  // Average salary of displaced workers (rough estimate: $55k baseline)
  const avgDisplacedSalary = 55000;

  // Distribute among job types with some randomness
  const templateIndex = month % NEW_JOB_TEMPLATES.length;
  const template = NEW_JOB_TEMPLATES[templateIndex];

  // Find or create this job category
  const existingIdx = updated.findIndex(j => j.title === template.titlePattern);

  if (existingIdx >= 0) {
    updated[existingIdx].workers += newWorkersThisMonth;
  } else {
    updated.push({
      id: `new-${template.type}-${month}`,
      title: template.titlePattern,
      type: template.type,
      workers: newWorkersThisMonth,
      averageSalary: Math.round(avgDisplacedSalary * template.salaryMultiplier * salaryMultiplier),
      createdAtMonth: month,
      cognitiveComplexity: Math.min(100, currentModel.capability + template.complexityOffset),
    });
  }

  // Also grow existing new job categories slightly (organic growth)
  for (const job of updated) {
    if (job.createdAtMonth < month) {
      job.workers *= 1.005; // 0.5% monthly organic growth
    }
  }

  return updated;
}

export function getTotalNewJobWorkers(newJobs: NewJobCategory[]): number {
  return newJobs.reduce((sum, j) => sum + j.workers, 0);
}
