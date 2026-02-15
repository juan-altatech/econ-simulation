import { useReducer, useCallback, useRef, useEffect } from 'react';
import { SimulationState, SimulationParams, MonthSnapshot, TimelinePreset } from '../engine/types';
import { simulateMonth } from '../engine/simulation';
import { seedJobs } from '../data/seedJobs';
import { generateModelSchedule } from '../data/presets';
import { defaultParams, scenarios } from '../data/scenarios';

type Action =
  | { type: 'TICK' }
  | { type: 'SET_PLAYING'; playing: boolean }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_PARAMS'; params: Partial<SimulationParams> }
  | { type: 'SET_PRESET'; preset: TimelinePreset }
  | { type: 'LOAD_SCENARIO'; scenario: string }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACKWARD' }
  | { type: 'RESET' }
  | { type: 'JUMP_TO_MONTH'; month: number };

function createInitialState(params: SimulationParams = defaultParams): SimulationState {
  const models = generateModelSchedule(params.timelinePreset, 240);
  const initialSnapshot = simulateMonth(0, seedJobs, models, params, null);

  return {
    currentMonth: 0,
    isPlaying: false,
    speed: 2,
    params,
    history: [initialSnapshot],
    jobs: seedJobs,
    models,
  };
}

function reducer(state: SimulationState, action: Action): SimulationState {
  switch (action.type) {
    case 'TICK':
    case 'STEP_FORWARD': {
      const nextMonth = state.currentMonth + 1;
      if (nextMonth > 240) return { ...state, isPlaying: false };

      // Check if we already have this month computed
      if (nextMonth < state.history.length) {
        return { ...state, currentMonth: nextMonth };
      }

      const prevSnapshot = state.history[state.history.length - 1];
      const snapshot = simulateMonth(nextMonth, state.jobs, state.models, state.params, prevSnapshot);

      return {
        ...state,
        currentMonth: nextMonth,
        history: [...state.history, snapshot],
      };
    }

    case 'STEP_BACKWARD': {
      if (state.currentMonth <= 0) return state;
      return { ...state, currentMonth: state.currentMonth - 1 };
    }

    case 'SET_PLAYING':
      return { ...state, isPlaying: action.playing };

    case 'SET_SPEED':
      return { ...state, speed: action.speed };

    case 'SET_PARAMS': {
      const newParams = { ...state.params, ...action.params };
      // If timeline preset changed, regenerate models
      const modelsChanged = action.params.timelinePreset && action.params.timelinePreset !== state.params.timelinePreset;
      const models = modelsChanged ? generateModelSchedule(newParams.timelinePreset, 240) : state.models;

      // Recompute from scratch with new params
      const history: MonthSnapshot[] = [];
      let prev: MonthSnapshot | null = null;
      for (let m = 0; m <= state.currentMonth; m++) {
        const snapshot = simulateMonth(m, state.jobs, models, newParams, prev);
        history.push(snapshot);
        prev = snapshot;
      }

      return { ...state, params: newParams, models, history };
    }

    case 'SET_PRESET': {
      const newParams = { ...state.params, timelinePreset: action.preset };
      const models = generateModelSchedule(action.preset, 240);
      const history: MonthSnapshot[] = [];
      let prev: MonthSnapshot | null = null;
      for (let m = 0; m <= state.currentMonth; m++) {
        const snapshot = simulateMonth(m, state.jobs, models, newParams, prev);
        history.push(snapshot);
        prev = snapshot;
      }
      return { ...state, params: newParams, models, history };
    }

    case 'LOAD_SCENARIO': {
      const scenario = scenarios[action.scenario];
      if (!scenario) return state;
      const params = { ...scenario.params };
      const models = generateModelSchedule(params.timelinePreset, 240);
      const initialSnapshot = simulateMonth(0, state.jobs, models, params, null);
      return {
        ...state,
        currentMonth: 0,
        isPlaying: false,
        params,
        models,
        history: [initialSnapshot],
      };
    }

    case 'RESET': {
      return createInitialState(state.params);
    }

    case 'JUMP_TO_MONTH': {
      const targetMonth = Math.max(0, Math.min(240, action.month));
      if (targetMonth <= state.currentMonth && targetMonth < state.history.length) {
        return { ...state, currentMonth: targetMonth };
      }
      // Need to simulate forward
      const history = [...state.history];
      let prev = history[history.length - 1];
      for (let m = history.length; m <= targetMonth; m++) {
        const snapshot = simulateMonth(m, state.jobs, state.models, state.params, prev);
        history.push(snapshot);
        prev = snapshot;
      }
      return { ...state, currentMonth: targetMonth, history };
    }

    default:
      return state;
  }
}

export function useSimulation() {
  const [state, dispatch] = useReducer(reducer, defaultParams, createInitialState);
  const intervalRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    dispatch({ type: 'TICK' });
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      const ms = 1000 / state.speed;
      intervalRef.current = window.setInterval(tick, ms);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isPlaying, state.speed, tick]);

  const currentSnapshot = state.history[state.currentMonth] ?? state.history[state.history.length - 1];

  return {
    state,
    currentSnapshot,
    dispatch,
    play: () => dispatch({ type: 'SET_PLAYING', playing: true }),
    pause: () => dispatch({ type: 'SET_PLAYING', playing: false }),
    stepForward: () => dispatch({ type: 'STEP_FORWARD' }),
    stepBackward: () => dispatch({ type: 'STEP_BACKWARD' }),
    setSpeed: (speed: number) => dispatch({ type: 'SET_SPEED', speed }),
    setParams: (params: Partial<SimulationParams>) => dispatch({ type: 'SET_PARAMS', params }),
    setPreset: (preset: TimelinePreset) => dispatch({ type: 'SET_PRESET', preset }),
    loadScenario: (scenario: string) => dispatch({ type: 'LOAD_SCENARIO', scenario }),
    reset: () => dispatch({ type: 'RESET' }),
    jumpToMonth: (month: number) => dispatch({ type: 'JUMP_TO_MONTH', month }),
  };
}
