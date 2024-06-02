import * as executor from 'actors/executor/types';
import * as miner from 'actors/miner/types';
import * as planner from 'actors/planner/types';
import * as supervisor from 'actors/supervisor/types';
import * as summarizer from 'actors/summarizer/types';
import { state, resetState } from './state';

export type Flow = Record<Actors, () => Promise<unknown>>;

type Runner<T> = (input: T) => Promise<string>;

type Runners = {
  runPlanner: Runner<planner.Input>;
  runExecutor: Runner<executor.Input>;
  runSupervisor: Runner<supervisor.Input>;
  runSummarizer: Runner<summarizer.Input>;
  runMiner: Runner<miner.Input>;
  runUser: Runner<Flow>;
};

type Lifecycle = {
  beforeCycle?: () => Promise<unknown>;
  afterCycle?: () => Promise<unknown>;
};

const buildFlow = (runners: Runners): Flow => {
  const { runPlanner, runExecutor, runMiner, runSummarizer, runSupervisor, runUser } = runners;

  const flow = {
    planner: async () => {
      state.results.planning = await runPlanner({
        task: state.globalGoal,
        insights: state.previousSummary,
        cycle: state.cycles,
        errors: state.errors,
      });

      return flow.executor();
    },
    executor: async () => {
      state.results.execution = await runExecutor(state.results.planning);
      return flow.supervisor();
    },
    supervisor: async () => {
      const { globalGoal, settings, cycles } = state;

      state.results.decision = await runSupervisor({
        goal: globalGoal,
        latestAction: state.results.execution,
      });

      if (cycles % settings.controlFrequency === settings.controlFrequency - 1) {
        return flow.user();
      }

      if (state.results.decision === 'planner') {
        return;
      }

      return flow[state.results.decision as 'miner']();
    },
    user: async () => {
      await runUser(flow);
    },
    miner: async () => {
      state.results.mining = await runMiner({
        task: state.globalGoal,
        action: state.results.planning,
        actionResult: state.results.execution,
      });
      return flow.summarizer();
    },
    summarizer: async () => {
      state.results.summarizing = await runSummarizer({
        task: state.globalGoal,
        action: state.results.planning,
        minerResponse: state.results.mining,
        previousSummary: state.previousSummary,
      });
      state.previousSummary = state.results.summarizing;
      state.startNextCycleFrom = 'planner';
    },
  };

  return flow;
};

export const buildPresetRunner = (runners: Runners, lifecycle?: Lifecycle) => {
  const { runUser } = runners;
  const flow = buildFlow(runners);

  return async (goal: string, settings: Partial<(typeof state)['settings']> = {}) => {
    resetState();

    state.globalGoal = goal;
    Object.assign(state.settings, settings);

    while (true) {
      try {
        // console.clear();

        // displayGlobalGoal();
        // await displayPreviousSummary();

        await lifecycle?.beforeCycle?.();

        const fn = flow[state.startNextCycleFrom];

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
        // writeLog('State after cycle', JSON.stringify(state, null, 2));
        await lifecycle?.afterCycle?.();

        state.cycles++;

        if (state.startNextCycleFrom === 'planner') {
          Object.keys(state.results).forEach((key) => {
            state.results[key as keyof typeof state.results] = '';
          });
        }
      }
    }
  };
};
