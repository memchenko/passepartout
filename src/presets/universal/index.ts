import merge from 'lodash/merge';
import { Object as O } from 'ts-toolbelt';
import * as executor from 'actors/executor/types';
import * as miner from 'actors/miner/types';
import * as planner from 'actors/planner/types';
import * as supervisor from 'actors/supervisor/types';
import * as summarizer from 'actors/summarizer/types';
import { state } from './state';
import { config } from './config';

export type Flow = Record<Actors, () => Promise<unknown>>;

type Runner<T> = (input: T) => Promise<string>;

type Runners = {
  runPlanner: Runner<planner.Input>;
  runExecutor: Runner<executor.Input>;
  runSupervisor: Runner<supervisor.Input>;
  runSummarizer: Runner<summarizer.Input>;
  runMiner: Runner<miner.Input>;
  runUser: () => Promise<void>;
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
        rules: config.rules.planner,
        previousAction: state.previousActionRequested,
      });

      return flow.executor();
    },
    executor: async () => {
      state.results.execution = await runExecutor({
        actionRequest: state.results.planning,
        rules: config.rules.executor,
      });
      return flow.supervisor();
    },
    supervisor: async () => {
      const { globalGoal, cycles } = state;

      state.results.decision = await runSupervisor({
        goal: globalGoal,
        latestAction: state.results.execution,
        rules: config.rules.supervisor,
      });

      if (cycles % config.controlFrequency === config.controlFrequency - 1) {
        return flow.user();
      }

      if (state.results.decision === 'planner') {
        return;
      }

      return flow[state.results.decision as 'miner']();
    },
    user: async () => {
      await runUser();
    },
    miner: async () => {
      state.results.mining = await runMiner({
        task: state.globalGoal,
        action: state.results.planning,
        actionResult: state.results.execution,
        rules: config.rules.miner,
      });
      return flow.summarizer();
    },
    summarizer: async () => {
      state.results.summarizing = await runSummarizer({
        task: state.globalGoal,
        action: state.results.planning,
        minerResponse: state.results.mining,
        previousSummary: state.previousSummary,
        rules: config.rules.summarizer,
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

  return async (goal: string, settings: O.Partial<typeof config, 'deep'> = {}) => {
    state.globalGoal = goal;
    Object.assign(config, merge(config, settings));

    while (true) {
      try {
        await lifecycle?.beforeCycle?.();

        const fn = flow[state.startNextCycleFrom];

        if (fn !== undefined) {
          await fn();
        }

        state.errors = [];
      } catch (err) {
        if (err instanceof Error) {
          state.errors.push(err.message);
          await runUser();
        }
      } finally {
        await lifecycle?.afterCycle?.();

        state.cycles++;

        if (state.startNextCycleFrom === 'planner') {
          state.previousActionRequested = state.results.planning;
          Object.keys(state.results).forEach((key) => {
            state.results[key as keyof typeof state.results] = '';
          });
        }

        if (state.finished) {
          return;
        }
      }
    }
  };
};
