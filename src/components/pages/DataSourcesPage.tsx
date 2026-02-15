export default function DataSourcesPage() {
  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-10 text-slate-300">
        <h1 className="text-3xl font-bold text-white mb-2">Data Sources & Methodology</h1>
        <p className="text-slate-400 mb-10 text-sm">
          A detailed breakdown of every data point, assumption, and source used in this simulator.
        </p>

        {/* ---- Labor Market Data ---- */}
        <Section title="Labor Market Data" id="labor">
          <p className="mb-4">
            The simulator models <strong className="text-white">60 job categories</strong> totaling
            approximately <strong className="text-white">157 million workers</strong>, representing the
            US civilian labor force. Employment counts and salary data are derived from the{' '}
            <strong className="text-white">Bureau of Labor Statistics (BLS)</strong> Occupational
            Employment and Wage Statistics (OEWS) program and Current Employment Statistics (CES)
            survey.
          </p>

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">Job Categories by Level</h4>

          <DataTable
            headers={['Level', 'Count', 'Workers', 'Examples']}
            rows={[
              ['Entry', '13', '~57M', 'Fast Food, Cashier, Warehouse, Home Health Aide, Retail Sales'],
              ['Mid', '27', '~73M', 'Truck Driver, Nurse, Teacher, Manufacturing, Cook/Chef'],
              ['Senior', '13', '~22M', 'Software Engineer, Lawyer, Project Manager, Physician'],
              ['Expert', '7', '~4M', 'Research Scientist, CEO, Surgeon, Airline Pilot'],
            ]}
          />

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">Industry Sectors</h4>
          <p className="mb-3">
            Jobs span 15 industry sectors. The largest by workforce:
          </p>
          <DataTable
            headers={['Sector', 'Jobs', 'Approx. Workers']}
            rows={[
              ['Professional Services', '10', '~30M'],
              ['Manufacturing', '4', '~22M'],
              ['Healthcare', '8', '~15M'],
              ['Retail', '3', '~19M'],
              ['Hospitality', '3', '~13M'],
              ['Transportation', '4', '~13M'],
              ['Construction', '4', '~7M'],
              ['Government', '4', '~10M'],
              ['Education', '3', '~9M'],
              ['Finance', '4', '~3M'],
              ['Technology', '4', '~6M'],
              ['Legal', '2', '~2M'],
              ['Agriculture', '2', '~5M'],
            ]}
          />
        </Section>

        {/* ---- Job Scoring System ---- */}
        <Section title="Job Scoring System" id="scoring">
          <p className="mb-4">
            Each of the 60 jobs is rated on four dimensions, each on a 1–100 scale. These scores
            determine when and how quickly a job becomes eligible for AI displacement.
          </p>

          <DataTable
            headers={['Dimension', 'What It Measures', 'Example Scores']}
            rows={[
              [
                'Cognitive Complexity',
                'How much abstract reasoning, creativity, and problem-solving the job requires',
                'Data Entry: 25, Nurse: 65, Surgeon: 95',
              ],
              [
                'Physical Requirement',
                'How much hands-on physical activity the job demands',
                'Accountant: 5, Warehouse: 80, Electrician: 85',
              ],
              [
                'Routine Score',
                'How repetitive and predictable the work is (higher = more routine)',
                'CEO: 10, Truck Driver: 75, Data Entry: 95',
              ],
              [
                'Human Interaction',
                'How critical face-to-face human contact is to the role',
                'Warehouse: 15, Software Eng: 35, Therapist: 98',
              ],
            ]}
          />

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">Scoring Methodology</h4>
          <p className="mb-3">
            Scores are assigned based on cross-referencing several sources:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-400 mb-4">
            <li><strong className="text-slate-300">O*NET OnLine</strong> — Detailed occupation attributes including knowledge, skills, abilities, and work context</li>
            <li><strong className="text-slate-300">BLS Occupational Outlook Handbook</strong> — Job duties, work environment, physical demands</li>
            <li><strong className="text-slate-300">Academic literature</strong> — Frey & Osborne (2017) automation probabilities, Acemoglu & Restrepo displacement models</li>
            <li><strong className="text-slate-300">Industry analysis</strong> — McKinsey Global Institute, World Economic Forum reports on automation potential</li>
          </ul>
          <p className="text-sm text-slate-500 italic">
            Note: These are modeled estimates, not precise measurements. The simulator allows you to
            override AI capability parameters to test different assumptions.
          </p>
        </Section>

        {/* ---- Salary Data ---- */}
        <Section title="Salary Data" id="salaries">
          <p className="mb-4">
            Median annual salaries are sourced from the <strong className="text-white">BLS OEWS</strong> May 2024
            estimates, rounded to the nearest thousand. Some representative examples:
          </p>
          <DataTable
            headers={['Job', 'Median Salary', 'Hourly Equivalent']}
            rows={[
              ['Fast Food Worker', '$28,000', '$13.46/hr'],
              ['Registered Nurse', '$86,000', '$41.35/hr'],
              ['Software Engineer', '$130,000', '$62.50/hr'],
              ['Physician / Doctor', '$230,000', '$110.58/hr'],
              ['Surgeon', '$350,000', '$168.27/hr'],
            ]}
          />
          <p className="text-sm text-slate-500 mt-3">
            Hourly equivalents assume 2,080 annual work hours (40 hrs/week × 52 weeks). This same conversion
            is used when comparing human wages to AI cost-per-hour for displacement eligibility.
          </p>
        </Section>

        {/* ---- AI Model Assumptions ---- */}
        <Section title="AI Model Release Schedule" id="models">
          <p className="mb-4">
            Rather than modeling a single continuous improvement curve, the simulator uses{' '}
            <strong className="text-white">discrete model releases</strong> — step-function jumps that
            reflect how AI capabilities advance in practice (new model launches, not gradual drift).
          </p>

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">Starting Conditions (Feb 2026)</h4>
          <DataTable
            headers={['Parameter', 'Initial Value', 'Basis']}
            rows={[
              ['Cognitive Capability', '55 / 100', 'Based on current frontier model performance (GPT-4/Claude class) across benchmarks'],
              ['Physical Capability', '10 / 100', 'Reflects limited robotics deployment; most AI is software-only'],
              ['Cost per Hour', '$8.00/hr', 'Estimated cost of running AI agent at ~GPT-4 throughput for 1 hour of equivalent work'],
              ['Reliability', '0.70 (70%)', 'Reflects current hallucination rates, need for human review on critical tasks'],
            ]}
          />

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">Timeline Presets</h4>
          <p className="mb-3">
            Three presets control how quickly new models are released and how much they improve:
          </p>
          <DataTable
            headers={['Preset', 'Release Interval', 'Capability Jump', 'Physical Growth', 'Reliability Growth', 'Cost Reduction/yr']}
            rows={[
              ['Aggressive', '~3.5 months', '+8 to +12', '+4 per release', '+0.03 per release', '45%'],
              ['Medium', '~5.5 months', '+5 to +8', '+2.5 per release', '+0.02 per release', '30%'],
              ['Slow', '~9 months', '+3 to +5', '+1.5 per release', '+0.012 per release', '17.5%'],
            ]}
          />
          <p className="text-sm text-slate-500 mt-3">
            The "aggressive" timeline is inspired by the pace of GPT-3 → GPT-4 → GPT-4o releases.
            "Slow" reflects scenarios where regulatory or technical barriers limit progress. All presets
            cap capability and reliability at 100 and 0.99 respectively.
          </p>

          <h4 className="text-white font-semibold text-sm mt-6 mb-3">Token Pricing</h4>
          <p className="mb-3">
            Base token prices start at <strong className="text-white">$1.00/1M input tokens</strong> and{' '}
            <strong className="text-white">$3.00/1M output tokens</strong>, declining exponentially based on
            the cost reduction rate. This reflects the observed ~40% annual price drops in API pricing
            since 2023.
          </p>
        </Section>

        {/* ---- Sector Reliability Requirements ---- */}
        <Section title="Sector-Specific Reliability Requirements" id="reliability">
          <p className="mb-4">
            Not all industries will accept the same level of AI reliability. Healthcare and legal
            sectors demand near-perfect performance before allowing AI to replace humans. These
            thresholds act as gates that delay displacement even when AI is otherwise capable and
            cost-competitive.
          </p>
          <DataTable
            headers={['Sector', 'Min. Reliability', 'Rationale']}
            rows={[
              ['Healthcare', '0.95 (95%)', 'Patient safety — errors can be fatal'],
              ['Legal', '0.92 (92%)', 'Legal liability and precedent sensitivity'],
              ['Finance', '0.90 (90%)', 'Fiduciary duty, regulatory compliance'],
              ['Government', '0.90 (90%)', 'Public accountability requirements'],
              ['Transportation', '0.88 (88%)', 'Physical safety (autonomous vehicles, etc.)'],
              ['Education', '0.85 (85%)', 'Child welfare and developmental concerns'],
              ['All Others', '0.60 (60%)', 'General commercial threshold — "good enough"'],
            ]}
          />
        </Section>

        {/* ---- Economic Parameters ---- */}
        <Section title="Economic Parameters & Baselines" id="economics">
          <p className="mb-4">
            The economic model uses the following baseline values, calibrated to the US economy circa 2025:
          </p>
          <DataTable
            headers={['Parameter', 'Value', 'Source / Basis']}
            rows={[
              ['Baseline GDP', '$28.0 trillion', 'BEA GDP estimate, 2025 Q4 annualized'],
              ['Total Workforce', '~160 million', 'BLS Current Population Survey'],
              ['Baseline Tax Rate', '18%', 'Effective federal + state tax rate on wage income'],
              ['Baseline Gini Coefficient', '0.39', 'Census Bureau, 2023 estimate'],
              ['Baseline Median Income', '$60,000', 'Census Bureau, 2023 median household income'],
              ['Unemployment Benefit', '$25,000/yr', 'Average annualized UI + supplemental benefits per displaced worker'],
              ['Baseline Gov Spending', '$0.5 trillion', 'Baseline safety net spending (pre-displacement)'],
              ['Productivity Boost (Augmented)', '1.5×', 'Estimated productivity multiplier for AI-augmented workers'],
              ['GDP Wage Multiplier (Human)', '2.0×', 'Wages → GDP contribution multiplier (includes non-wage value-add)'],
              ['GDP Wage Multiplier (Augmented)', '2.2×', 'Augmented workers contribute more per dollar of wages'],
              ['AI Value Capture', '60%', 'AI performs 60% of the value humans did when replacing them'],
            ]}
          />
        </Section>

        {/* ---- Scenarios ---- */}
        <Section title="Named Scenarios" id="scenarios">
          <p className="mb-4">
            Three pre-configured scenarios combine different assumptions to model plausible futures:
          </p>

          <ScenarioCard
            name="Techno-Optimist"
            description="Aggressive AI progress with high job creation and fast worker retraining"
            params={[
              ['Timeline', 'Aggressive'],
              ['Job Creation Rate', '80% of displaced workers'],
              ['New Job Salary', '110% of displaced average'],
              ['Retraining Period', '6 months'],
              ['Cost Reduction', '45%/year'],
            ]}
          />
          <ScenarioCard
            name="Baseline"
            description="Medium-paced AI progress with moderate job creation"
            params={[
              ['Timeline', 'Medium'],
              ['Job Creation Rate', '40% of displaced workers'],
              ['New Job Salary', '85% of displaced average'],
              ['Retraining Period', '12 months'],
              ['Cost Reduction', '30%/year'],
            ]}
          />
          <ScenarioCard
            name="Disruption Shock"
            description="Aggressive AI with low job creation and slow retraining"
            params={[
              ['Timeline', 'Aggressive'],
              ['Job Creation Rate', '20% of displaced workers'],
              ['New Job Salary', '65% of displaced average'],
              ['Retraining Period', '24 months'],
              ['Cost Reduction', '45%/year'],
            ]}
          />
        </Section>

        {/* ---- New Jobs ---- */}
        <Section title="New Job Categories" id="new-jobs">
          <p className="mb-4">
            As AI displaces existing jobs, the simulator creates new employment categories across four types:
          </p>
          <DataTable
            headers={['Type', 'Examples', 'Salary Range', 'Rationale']}
            rows={[
              [
                'AI-Adjacent',
                'AI Training Specialist, Prompt Engineer, AI Auditor, AI Systems Monitor',
                '80–115% of displaced avg',
                'Jobs that exist to build, train, and maintain AI systems',
              ],
              [
                'New Category',
                'Experience Designer, Digital Twin Manager, Synthetic Media Producer',
                '85–105% of displaced avg',
                'Entirely new roles enabled by AI technology',
              ],
              [
                'Human Premium',
                'Artisanal Craftsperson, Human-Certified Educator, Personal Wellness Guide',
                '70–90% of displaced avg',
                'Roles where human touch becomes a premium differentiator',
              ],
              [
                'Oversight & Governance',
                'AI Ethics Officer, Algorithmic Fairness Auditor, AI Safety Researcher',
                '85–120% of displaced avg',
                'Regulatory, ethics, and safety roles for AI governance',
              ],
            ]}
          />
          <p className="text-sm text-slate-500 mt-3">
            New job creation is proportional to monthly displacement, controlled by the "Job Creation Rate"
            parameter (default 40%). Existing new jobs grow organically at 0.5% per month.
          </p>
        </Section>

        {/* ---- Limitations ---- */}
        <Section title="Limitations & Caveats" id="limitations">
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-400">
            <li>
              <strong className="text-slate-300">Simplified labor market</strong> — 60 categories cannot capture
              the full complexity of 800+ BLS occupations. We aggregate into representative buckets.
            </li>
            <li>
              <strong className="text-slate-300">No geographic variation</strong> — The model treats the US as
              a single labor market with no regional differences.
            </li>
            <li>
              <strong className="text-slate-300">Deterministic displacement</strong> — Real-world adoption depends
              on regulation, corporate inertia, union bargaining, and cultural resistance not modeled here.
            </li>
            <li>
              <strong className="text-slate-300">Linear salary effects</strong> — Income distribution changes
              are modeled with simple multipliers, not full microsimulation.
            </li>
            <li>
              <strong className="text-slate-300">No international effects</strong> — Global trade, offshoring,
              and immigration are not modeled.
            </li>
            <li>
              <strong className="text-slate-300">AI capability scores are estimates</strong> — There is no consensus
              benchmark that maps to a single 1–100 "capability" number. Our scores represent a subjective synthesis.
            </li>
            <li>
              <strong className="text-slate-300">New job projections are speculative</strong> — The types and volume
              of jobs AI will create is inherently uncertain.
            </li>
          </ul>
        </Section>

        <div className="border-t border-slate-800 mt-12 pt-6 text-xs text-slate-600 text-center">
          All data is modeled for educational and exploratory purposes. This is not financial or policy advice.
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

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-800/60">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 text-slate-400 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/20'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScenarioCard({
  name,
  description,
  params,
}: {
  name: string;
  description: string;
  params: [string, string][];
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 mb-3">
      <h4 className="text-white font-semibold text-sm">{name}</h4>
      <p className="text-slate-500 text-xs mb-3">{description}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {params.map(([label, value]) => (
          <div key={label} className="text-xs">
            <span className="text-slate-500">{label}: </span>
            <span className="text-slate-300">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
