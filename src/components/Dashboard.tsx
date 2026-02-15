import { useSimulation } from '../hooks/useSimulation';
import ControlPanel from './ControlPanel';
import SimulationControls from './SimulationControls';
import MetricsCards from './charts/MetricsCards';
import EmploymentChart from './charts/EmploymentChart';
import GDPChart from './charts/GDPChart';
import SectorDisplacement from './charts/SectorDisplacement';
import IncomeDistribution from './charts/IncomeDistribution';
import AICapabilityTimeline from './charts/AICapabilityTimeline';
import CompoundingEffects from './charts/CompoundingEffects';
import JobTable from './JobTable';

export default function Dashboard() {
  const {
    state,
    currentSnapshot,
    play,
    pause,
    stepForward,
    stepBackward,
    setSpeed,
    setParams,
    setPreset,
    loadScenario,
    reset,
    jumpToMonth,
  } = useSimulation();

  const prevSnapshot = state.currentMonth > 0 ? state.history[state.currentMonth - 1] : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <ControlPanel
        params={state.params}
        currentSnapshot={currentSnapshot}
        onParamsChange={setParams}
        onPresetChange={setPreset}
        onScenarioLoad={loadScenario}
        onReset={reset}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Controls */}
        <SimulationControls
          isPlaying={state.isPlaying}
          speed={state.speed}
          currentMonth={state.currentMonth}
          currentSnapshot={currentSnapshot}
          onPlay={play}
          onPause={pause}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onSpeedChange={setSpeed}
          onJumpToMonth={jumpToMonth}
        />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Metrics Cards */}
          <MetricsCards snapshot={currentSnapshot} prevSnapshot={prevSnapshot} />

          {/* Row 1: Employment + GDP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EmploymentChart
              history={state.history}
              currentMonth={state.currentMonth}
              models={state.models}
            />
            <GDPChart
              history={state.history}
              currentMonth={state.currentMonth}
            />
          </div>

          {/* Row 2: Sector Displacement + AI Capability */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectorDisplacement
              snapshot={currentSnapshot}
              jobs={state.jobs}
            />
            <AICapabilityTimeline
              history={state.history}
              currentMonth={state.currentMonth}
              models={state.models}
            />
          </div>

          {/* Row 3: Income Distribution */}
          <IncomeDistribution
            history={state.history}
            currentMonth={state.currentMonth}
          />

          {/* Row 4: Job Table */}
          <JobTable
            jobs={state.jobs}
            snapshot={currentSnapshot}
          />

          {/* Row 5: Compounding Effects */}
          <CompoundingEffects
            history={state.history}
            currentMonth={state.currentMonth}
          />
        </div>
      </div>
    </div>
  );
}
