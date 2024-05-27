import { writeLog } from 'helpers/log';
import { state, displayGlobalGoal, displayPreviousSummary } from './common';
import { runPlanner } from './planner';
import { runExecutor } from './executor';
import { runSupervisor } from './supervisor';
import { runMiner } from './miner';
import { runSummarizer } from './summarizer';
import { runUser } from './user';

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
    results.decision = await runSupervisor(state.globalGoal, results.execution);

    if (state.cycles % 3 === 2) {
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

export const iterate = async (goal: string) => {
  state.globalGoal = goal;

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
