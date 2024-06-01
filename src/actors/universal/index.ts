import { writeLog } from 'helpers/log';
import { displayGlobalGoal, displayPreviousSummary } from './common';
import { runPlanner } from './planner';
import { runExecutor } from './executor';
import { runSupervisor } from './supervisor';
import { runMiner } from './miner';
import { runSummarizer } from './summarizer';
import { runUser } from './user';
import { state, resetState } from './state';

const { results } = state;

type Actors = 'planner' | 'executor' | 'supervisor' | 'user' | 'miner' | 'summarizer';

const flow: Record<Actors, () => Promise<unknown>> = {
  planner: async () => {
    results.planning = await runPlanner({
      task: state.globalGoal,
      insights: state.previousSummary,
      cycle: state.cycles,
      errors: state.errors,
    });

    return flow.executor();
  },
  executor: async () => {
    results.execution = await runExecutor(results.planning);
    return flow.supervisor();
  },
  supervisor: async () => {
    const { globalGoal, settings, cycles } = state;

    results.decision = await runSupervisor(globalGoal, results.execution);

    if (cycles % settings.controlFrequency === settings.controlFrequency - 1) {
      return flow.user();
    }

    if (results.decision === 'planner') {
      return;
    }

    return flow[results.decision as 'miner']();
  },
  user: async () => {
    await runUser(flow);
  },
  miner: async () => {
    results.mining = await runMiner(state.globalGoal, results.planning, results.execution);
    return flow.summarizer();
  },
  summarizer: async () => {
    results.summarizing = await runSummarizer({
      task: state.globalGoal,
      action: results.planning,
      minerResponse: results.mining,
      previousSummary: state.previousSummary,
    });
    state.previousSummary = results.summarizing;
    state.startNextCycleFrom = 'planner';
  },
};

export const run = async (goal: string, settings: Partial<(typeof state)['settings']> = {}) => {
  resetState();

  state.globalGoal = goal;
  Object.assign(state.settings, settings);

  while (true) {
    try {
      console.clear();

      displayGlobalGoal();
      await displayPreviousSummary();

      const fn = flow[state.startNextCycleFrom as Actors];

      if (fn !== undefined) {
        await fn();
      }

      state.errors = [];
    } catch (err) {
      if (err instanceof Error) {
        state.errors.push(err.message);
        await runUser(flow);
      }
    } finally {
      writeLog('State after cycle', JSON.stringify(state, null, 2));

      state.cycles++;

      if (state.startNextCycleFrom === 'planner') {
        Object.keys(results).forEach((key) => {
          results[key as keyof typeof results] = '';
        });
      }
    }
  }
};
