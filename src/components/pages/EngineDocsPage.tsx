export default function EngineDocsPage() {
  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-10 text-slate-300">
        <h1 className="text-3xl font-bold text-white mb-2">Engine Documentation</h1>
        <p className="text-slate-400 mb-10 text-sm">
          How the simulation engine works, step by step, with annotated code from the actual source.
        </p>

        {/* ---- Overview ---- */}
        <Section title="Architecture Overview" id="overview">
          <p className="mb-4">
            The engine is built as a set of <strong className="text-white">pure functions</strong> —
            given the same inputs, they always produce the same outputs. There is no randomness in the
            core simulation loop (model release schedules use seeded pseudo-random capability jumps).
          </p>
          <p className="mb-4">The engine is organized into five modules:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {[
              ['simulation.ts', 'Core loop — orchestrates each month'],
              ['displacement.ts', 'S-curve displacement logic'],
              ['economics.ts', 'GDP, tax, inequality calculations'],
              ['models.ts', 'AI model selection & cost calculations'],
              ['newJobs.ts', 'New job creation from displacement'],
            ].map(([file, desc]) => (
              <div key={file} className="bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
                <code className="text-blue-400 text-xs">{file}</code>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400">
            The simulation runs month-by-month from February 2026 (month 0) through January 2046
            (month 240). Each month produces a <code className="text-blue-400">MonthSnapshot</code> that
            captures employment, displacement, new jobs, economics, and AI state.
          </p>
        </Section>

        {/* ---- Main Loop ---- */}
        <Section title="The Simulation Loop" id="loop">
          <p className="mb-4">
            The <code className="text-blue-400">runSimulation()</code> function drives the entire simulation.
            It iterates over each month, calling <code className="text-blue-400">simulateMonth()</code>:
          </p>
          <CodeBlock language="typescript" code={`function runSimulation(
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
}`} />
          <p className="mt-4 mb-4">
            Each call to <code className="text-blue-400">simulateMonth()</code> performs these steps in order:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-400 mb-4">
            <li><strong className="text-slate-300">Resolve current AI model</strong> — Find which model is active at this month</li>
            <li><strong className="text-slate-300">Apply parameter overrides</strong> — If the user has overridden capability, physical, or reliability, use those values</li>
            <li><strong className="text-slate-300">Calculate AI cost</strong> — Determine the effective $/hour for AI at this point</li>
            <li><strong className="text-slate-300">Update displacement</strong> — For each of 60 jobs, check eligibility and advance the S-curve</li>
            <li><strong className="text-slate-300">Generate new jobs</strong> — Create AI-era jobs proportional to displacement</li>
            <li><strong className="text-slate-300">Calculate economics</strong> — GDP, tax revenue, inequality, consumer spending, etc.</li>
            <li><strong className="text-slate-300">Produce snapshot</strong> — Bundle everything into a MonthSnapshot</li>
          </ol>
        </Section>

        {/* ---- AI Model Selection ---- */}
        <Section title="AI Model Selection & Cost" id="models">
          <p className="mb-4">
            Models are released as discrete events. The engine picks the most recent model that has been
            released by the current month:
          </p>
          <CodeBlock language="typescript" code={`function getCurrentModel(models: AIModel[], month: number): AIModel {
  let current = models[0];
  for (const model of models) {
    if (model.releaseMonth <= month) {
      current = model;
    } else {
      break;  // models are sorted by release date
    }
  }
  return current;
}`} />

          <p className="mt-4 mb-4">
            AI cost per hour declines over time based on the cost reduction rate. The formula accounts for
            both the base cost of the model and time elapsed since that model's release:
          </p>
          <CodeBlock language="typescript" code={`function getAICostPerHour(
  model: AIModel,
  month: number,
  costReductionRate: number
): number {
  const annualReduction = costReductionRate / 100;
  const monthsSinceRelease = month - model.releaseMonth;
  const additionalReduction = Math.pow(
    1 - annualReduction,
    monthsSinceRelease / 12
  );
  return model.costPerHour * additionalReduction;
}`} />
          <Callout>
            A model that starts at $8.00/hr with 30% annual reduction will cost ~$5.60/hr after 1 year,
            ~$3.92/hr after 2 years, and ~$1.34/hr after 5 years. This exponential decline is key to
            displacement — even expensive jobs eventually become cheaper to automate.
          </Callout>
        </Section>

        {/* ---- Displacement Eligibility ---- */}
        <Section title="Displacement Eligibility" id="eligibility">
          <p className="mb-4">
            A job becomes eligible for displacement only when <strong className="text-white">all four conditions</strong> are
            met simultaneously. This creates a gating mechanism — AI must be capable, physically able,
            cheaper, and reliable enough for the specific job:
          </p>
          <CodeBlock language="typescript" code={`function checkDisplacementEligibility(
  job: JobCategory,
  model: AIModel,
  aiCostPerHour: number,
  displacementThreshold: number
): boolean {
  const hourlySalary = job.medianSalary / 2080;

  return (
    // 1. AI cognitive capability exceeds job complexity
    model.capability >= job.cognitiveComplexity &&

    // 2. AI physical capability meets at least 50% of job's
    //    physical requirement
    model.physicalCapability >= job.physicalRequirement * 0.5 &&

    // 3. AI cost is below the displacement threshold
    //    (e.g., AI must be < 50% the cost of human labor)
    aiCostPerHour < hourlySalary * displacementThreshold &&

    // 4. AI reliability meets the sector-specific minimum
    model.reliability >= reliabilityFloor(job)
  );
}`} />

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">Why These Four Gates?</h4>
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              <strong className="text-slate-300">Capability gate:</strong> A model with capability 55 can handle
              jobs with cognitive complexity ≤ 55 (data entry at 25, cashier at 15) but not nursing at 65.
            </p>
            <p>
              <strong className="text-slate-300">Physical gate (50% threshold):</strong> AI only needs to meet
              half the physical requirement because many physical tasks can be partially automated or restructured.
              A warehouse worker (physical: 80) needs AI physical capability ≥ 40.
            </p>
            <p>
              <strong className="text-slate-300">Cost gate:</strong> The displacement threshold (default 0.5) means
              AI must cost less than 50% of the human hourly rate. This models the "switching cost" — companies
              need a significant saving to justify the disruption.
            </p>
            <p>
              <strong className="text-slate-300">Reliability gate:</strong> Sector-specific minimums prevent
              displacement in safety-critical fields until AI achieves very high reliability. Healthcare requires
              95%, while retail only requires 60%.
            </p>
          </div>

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">Reliability Floors by Sector</h4>
          <CodeBlock language="typescript" code={`function reliabilityFloor(job: JobCategory): number {
  switch (job.sector) {
    case 'Healthcare':      return 0.95;
    case 'Finance':         return 0.90;
    case 'Legal':           return 0.92;
    case 'Government':      return 0.90;
    case 'Transportation':  return 0.88;
    case 'Education':       return 0.85;
    default:                return 0.60;
  }
}`} />
        </Section>

        {/* ---- S-Curve Displacement ---- */}
        <Section title="S-Curve Displacement Progression" id="scurve">
          <p className="mb-4">
            Once a job becomes eligible for displacement, workers aren't replaced overnight. Instead,
            displacement follows a <strong className="text-white">logistic S-curve</strong> — slow adoption
            at first, rapid acceleration in the middle, then a plateau. This models real-world technology
            adoption patterns.
          </p>
          <CodeBlock language="typescript" code={`function sCurve(
  monthsSinceEligible: number,
  humanInteraction: number
): number {
  // Drag factor: high-interaction jobs adopt AI more slowly
  const dragFactor = 1 - humanInteraction / 200;
  const effectiveMonths = monthsSinceEligible * dragFactor;

  // Asymptotic limit: high-interaction jobs retain more workers
  // A job with humanInteraction=0 can lose up to 95% of workers
  // A job with humanInteraction=100 can lose at most 70%
  const maxDisplacement = 1 - (humanInteraction / 100) * 0.25 - 0.05;

  // Standard logistic function
  // Midpoint at ~18 months, steepness k=0.15
  const k = 0.15;
  const midpoint = 18;
  const raw = 1 / (1 + Math.exp(-k * (effectiveMonths - midpoint)));

  return Math.min(maxDisplacement, raw * maxDisplacement);
}`} />

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">Key Properties of the S-Curve</h4>
          <div className="space-y-3 text-sm text-slate-400 mb-4">
            <p>
              <strong className="text-slate-300">Human Interaction Drag:</strong> A job with humanInteraction = 80
              has a drag factor of 0.6, meaning it takes ~1.67× longer to progress through the curve compared
              to a job with humanInteraction = 0 (drag factor = 1.0).
            </p>
            <p>
              <strong className="text-slate-300">Asymptotic Limit:</strong> No job loses 100% of workers. The
              maximum displacement ranges from 70% (high human interaction) to 95% (no human interaction).
              This reflects that some human presence is always needed for edge cases, oversight, or consumer preference.
            </p>
            <p>
              <strong className="text-slate-300">Midpoint at 18 months:</strong> The inflection point — fastest
              displacement — occurs ~18 effective months after eligibility begins. Before this, adoption is slow
              (pilot programs, testing). After, it decelerates as easy-to-automate tasks are completed.
            </p>
            <p>
              <strong className="text-slate-300">Irreversibility:</strong> Displacement never reverses. If a model
              upgrade temporarily makes a job ineligible (unlikely but possible with parameter overrides), the
              displacement percentage is locked at its previous value.
            </p>
          </div>

          <Callout>
            Example: A Data Entry Clerk (humanInteraction: 10, maxDisplacement: 92.5%) becomes eligible
            at month 3. By month 12 (~9 effective months), about 15% are displaced. By month 21 (~18
            effective months), ~46% are displaced. By month 36, ~85% are displaced, approaching the ceiling.
          </Callout>
        </Section>

        {/* ---- AI Augmentation ---- */}
        <Section title="AI Augmentation (Not Just Displacement)" id="augmentation">
          <p className="mb-4">
            The engine models a middle ground between "fully employed" and "fully displaced" —{' '}
            <strong className="text-white">AI augmentation</strong>. These are workers who still have their jobs
            but use AI tools to be more productive.
          </p>
          <CodeBlock language="typescript" code={`// Augmentation eligibility: AI capability is within range
// of the job's cognitive complexity
const augmentationEligible =
  model.capability >= job.cognitiveComplexity * 0.6 &&
  model.capability < job.cognitiveComplexity + 20;

// Up to 70% of remaining workers can be augmented
const augmentedFraction = augmentationEligible
  ? Math.min(0.7,
      (model.capability - job.cognitiveComplexity * 0.6) /
      (job.cognitiveComplexity * 0.4 + 20) * 0.7
    )
  : eligible
    ? 0.3  // displacement-eligible jobs: 30% augmented
    : 0;

const aiAugmentedWorkers =
  remainingWorkers * Math.max(0, augmentedFraction);`} />
          <p className="mt-4 text-sm text-slate-400">
            Augmentation kicks in <em>before</em> displacement. A job with cognitive complexity 70 starts
            seeing augmentation when AI capability hits 42 (70 × 0.6). This means nurses, teachers, and
            engineers can benefit from AI tools long before their jobs are threatened.
          </p>
        </Section>

        {/* ---- New Job Creation ---- */}
        <Section title="New Job Creation" id="new-jobs">
          <p className="mb-4">
            As displacement occurs, the economy generates new types of jobs. The engine creates workers in
            new roles proportional to the displacement rate:
          </p>
          <CodeBlock language="typescript" code={`// How many new workers to create this month
const newWorkersThisMonth = totalDisplacedThisMonth * creationRate;

// Cycle through 20 job templates, one per month
const templateIndex = month % NEW_JOB_TEMPLATES.length;
const template = NEW_JOB_TEMPLATES[templateIndex];

// Either add workers to existing category or create new one
if (existingIdx >= 0) {
  updated[existingIdx].workers += newWorkersThisMonth;
} else {
  updated.push({
    id: \`new-\${template.type}-\${month}\`,
    title: template.titlePattern,
    type: template.type,
    workers: newWorkersThisMonth,
    averageSalary: avgDisplacedSalary *
      template.salaryMultiplier * salaryMultiplier,
    createdAtMonth: month,
    cognitiveComplexity: Math.min(100,
      currentModel.capability + template.complexityOffset),
  });
}

// Organic growth for existing new jobs: 0.5% per month
for (const job of updated) {
  if (job.createdAtMonth < month) {
    job.workers *= 1.005;
  }
}`} />

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">20 Job Templates</h4>
          <p className="mb-3 text-sm text-slate-400">
            The engine rotates through 20 templates across four categories, creating a diverse mix of new
            employment. Each template has a salary multiplier relative to the average displaced salary ($55k baseline)
            and a complexity offset that positions the job above current AI capability — ensuring new jobs are
            harder to immediately automate.
          </p>

          <Callout>
            The <strong>creationRate</strong> parameter (default 0.4) is the most important lever here. At 0.4,
            40% of each month's newly displaced workers find new AI-era jobs. The Techno-Optimist scenario uses
            0.8, while Disruption Shock uses 0.2. This single parameter dramatically changes outcomes.
          </Callout>
        </Section>

        {/* ---- Economics ---- */}
        <Section title="Economic Calculations" id="economics">
          <p className="mb-4">
            The economics module calculates GDP composition, tax revenue, inequality, and other macro
            indicators each month.
          </p>

          <h4 className="text-white font-semibold text-sm mt-4 mb-3">GDP Composition</h4>
          <p className="mb-3 text-sm text-slate-400">
            GDP is built from three sources:
          </p>
          <CodeBlock language="typescript" code={`// 1. Human labor GDP: pure human workers × salary × multiplier
for (let i = 0; i < jobs.length; i++) {
  const pureHumanWorkers = state.currentWorkers - state.aiAugmentedWorkers;
  humanWageIncome += pureHumanWorkers * 1e6 * job.medianSalary;

  // 2. Augmented labor: AI-using workers are 1.5x more productive
  const productivityBoost = 1.5;
  augmentedWageIncome +=
    state.aiAugmentedWorkers * 1e6 * job.medianSalary * productivityBoost;
}

// Convert wages to GDP (2.0–2.2× multiplier from wages to output)
const humanLaborGDP = (humanWageIncome / 1e12) * 2.0;
const augmentedLaborGDP = (augmentedWageIncome / 1e12) * 2.2;

// 3. AI-only GDP: displaced work done by AI at 60% value
const displacedFraction = totalDisplaced / totalOriginalWorkers;
const aiOnlyGDP = BASELINE_GDP * displacedFraction * 0.6;

const totalGDP = humanLaborGDP + augmentedLaborGDP
  + newJobGDP + aiOnlyGDP;`} />

          <Callout>
            Worker counts are stored in millions (e.g., 6.5 = 6.5 million workers). The <code className="text-blue-400">* 1e6</code> conversion
            to actual headcount is critical — without it, GDP calculations would be off by a factor of one million.
          </Callout>

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">Income Inequality</h4>
          <CodeBlock language="typescript" code={`// Gini coefficient rises with displacement, moderated by new jobs
const newJobFraction =
  newJobs.reduce((s, j) => s + j.workers, 0) / totalOriginalWorkers;
const inequalityPressure =
  displacedFraction * 0.15 - newJobFraction * 0.05;
const giniCoefficient = Math.min(0.65,
  Math.max(0.30, BASELINE_GINI + inequalityPressure)
);

// Income percentiles shift based on displacement & augmentation
const displacementEffect = 1 - displacedFraction * 0.3;
const augmentationEffect =
  1 + (totalAugmented / totalOriginalWorkers) * 0.2;

const medianIncome = 60000 * displacementEffect * augmentationEffect;
const income10th = 22000 * (1 - displacedFraction * 0.5);
// Bottom 10% hit hardest by displacement
const income90th = 155000 * augmentationEffect *
  (1 + displacedFraction * 0.1);
// Top 10% benefit from augmentation AND displacement`} />

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">Other Economic Indicators</h4>
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              <strong className="text-slate-300">Tax Revenue</strong> = wage income × 18% + AI-only GDP × 10%
              (assuming some form of AI/corporate taxation)
            </p>
            <p>
              <strong className="text-slate-300">Consumer Spending Index</strong> (baseline 100) =
              employment ratio × 100 + augmentation bonus. Falls as jobs are lost, partially offset by
              augmented worker productivity.
            </p>
            <p>
              <strong className="text-slate-300">Corporate Profit Index</strong> (baseline 100) rises as
              labor costs are displaced: 100 + (displaced fraction × 40) + augmentation bonus. Companies
              capture 40% of labor cost savings as profit.
            </p>
            <p>
              <strong className="text-slate-300">Government Safety Net Spending</strong> = displaced workers
              on benefits × $25k/year + $0.5T baseline. The retraining period parameter controls how long
              workers stay on benefits.
            </p>
            <p>
              <strong className="text-slate-300">Productivity Multiplier</strong> = 1 + (augmented share × 0.8) +
              (displaced share × 0.3). Economy-wide productivity rises from both augmentation and AI replacing
              human work.
            </p>
          </div>
        </Section>

        {/* ---- State Management ---- */}
        <Section title="State Management & Playback" id="state">
          <p className="mb-4">
            The UI uses React's <code className="text-blue-400">useReducer</code> hook to manage simulation state.
            The full simulation history is pre-computed upfront and stored in memory, which enables instant
            scrubbing to any month.
          </p>
          <CodeBlock language="typescript" code={`// Simplified state shape
interface SimulationState {
  currentMonth: number;   // Which month we're viewing
  isPlaying: boolean;     // Auto-advance enabled?
  speed: number;          // Months per second
  params: SimulationParams;
  history: MonthSnapshot[];  // All 241 months pre-computed
  jobs: JobCategory[];       // The 60 seed jobs
  models: AIModel[];         // Generated model schedule
}

// Key actions
type Action =
  | { type: 'TICK' }          // Advance one month (during playback)
  | { type: 'JUMP_TO_MONTH'; month: number }  // Scrubber
  | { type: 'SET_PARAMS'; params: Partial<SimulationParams> }
  | { type: 'LOAD_SCENARIO'; scenario: string }
  | { type: 'RESET' };`} />
          <p className="mt-4 text-sm text-slate-400">
            When parameters change (via sliders or scenario loading), the entire simulation is
            re-computed from scratch. Since the engine is pure and fast (~50ms for 240 months), this
            provides a responsive experience without incremental state management complexity.
          </p>
        </Section>

        {/* ---- Token Pricing ---- */}
        <Section title="Token Pricing Model" id="tokens">
          <p className="mb-4">
            Token prices decline exponentially from their starting values, modeling the observed trend
            in API pricing:
          </p>
          <CodeBlock language="typescript" code={`function getTokenPrices(
  month: number,
  costReductionRate: number,
  inputOverride: number | null,
  outputOverride: number | null
) {
  const basePriceInput = 1.0;   // $/1M tokens at month 0
  const basePriceOutput = 3.0;  // $/1M tokens at month 0
  const annualReduction = costReductionRate / 100;
  const years = month / 12;
  const factor = Math.pow(1 - annualReduction, years);

  return {
    input: inputOverride ?? basePriceInput * factor,
    output: outputOverride ?? basePriceOutput * factor,
  };
}`} />
          <p className="mt-4 text-sm text-slate-400">
            With the default 30% annual reduction: input tokens go from $1.00 → $0.70 → $0.49 → $0.34
            per million tokens over three years. Users can override these prices directly to test specific
            pricing assumptions.
          </p>
        </Section>

        {/* ---- Data Flow Diagram ---- */}
        <Section title="Data Flow Summary" id="dataflow">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 font-mono text-xs leading-loose text-slate-400">
            <pre>{`┌─────────────────────────────────────────────────────┐
│                  For each month (0–240)              │
│                                                     │
│  ┌─────────────┐    ┌──────────────────┐            │
│  │ AI Models   │───▶│ getCurrentModel  │            │
│  │ Schedule    │    │ + Apply Overrides│            │
│  └─────────────┘    └───────┬──────────┘            │
│                             │                       │
│  ┌─────────────┐    ┌───────▼──────────┐            │
│  │ 60 Seed     │───▶│ For each job:    │            │
│  │ Jobs        │    │  checkEligibility│            │
│  └─────────────┘    │  updateDisplace- │            │
│                     │  ment (S-curve)  │            │
│                     └───────┬──────────┘            │
│                             │                       │
│  ┌─────────────┐    ┌───────▼──────────┐            │
│  │ Prev Month  │───▶│ generateNewJobs  │            │
│  │ New Jobs    │    │ (20 templates)   │            │
│  └─────────────┘    └───────┬──────────┘            │
│                             │                       │
│                     ┌───────▼──────────┐            │
│                     │ calculateEconomics│            │
│                     │ (GDP, Gini, tax) │            │
│                     └───────┬──────────┘            │
│                             │                       │
│                     ┌───────▼──────────┐            │
│                     │  MonthSnapshot   │──▶ history │
│                     └──────────────────┘            │
└─────────────────────────────────────────────────────┘`}</pre>
          </div>
        </Section>

        <div className="border-t border-slate-800 mt-12 pt-6 text-xs text-slate-600 text-center">
          Engine source code is in <code>src/engine/</code>. All functions are pure and stateless.
        </div>
      </div>
    </div>
  );
}

/* ---- Helper Components ---- */

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12">
      <h2 className="text-xl font-bold text-white mb-1 pb-2 border-b border-slate-800">{title}</h2>
      <div className="mt-4 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="relative rounded-lg overflow-hidden border border-slate-800">
      <div className="flex items-center justify-between bg-slate-800/80 px-3 py-1.5">
        <span className="text-[10px] text-slate-500 font-mono">{language}</span>
        <span className="text-[10px] text-slate-600">engine source</span>
      </div>
      <pre className="bg-slate-900/80 p-4 overflow-x-auto text-xs leading-relaxed">
        <code className="text-slate-300">{code}</code>
      </pre>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-950/30 border-l-2 border-blue-500 rounded-r-lg px-4 py-3 my-4 text-sm text-slate-400">
      {children}
    </div>
  );
}
