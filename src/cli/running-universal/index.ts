import * as executor from 'actors/executor';
import * as miner from 'actors/miner';
import * as planner from 'actors/planner';
import * as supervisor from 'actors/supervisor';
import * as summarizer from 'actors/summarizer';
import { buildPresetRunner } from 'presets/universal';
import { state } from 'presets/universal/state';
import { writeLog } from 'lib/log';
import { displaySection } from 'lib/cli';
import { runUser } from './handlers/whatsNext';
import { wrapActorRunner, displaySummary } from './common';

export const runExecutor = wrapActorRunner(executor.run, {
  runnerName: 'Executor',
  startText: 'Executing...',
  successText: 'Executed successfully.',
  failureText: 'Execution failed.',
});

export const runMiner = wrapActorRunner(miner.run, {
  runnerName: 'Miner',
  startText: 'Mining...',
  successText: 'Insights obtained.',
  failureText: 'Mining failed.',
});

export const runPlanner = wrapActorRunner(planner.run, {
  runnerName: 'Planner',
  startText: 'Planning...',
  successText: 'Step planned.',
  failureText: 'Planning failed.',
});

export const runSupervisor = wrapActorRunner(supervisor.run, {
  runnerName: 'Supervisor',
  startText: "Diciding who's next...",
  successText: 'Next actor is selected.',
  failureText: 'Decision failed.',
});

export const runSummarizer = wrapActorRunner(summarizer.run, {
  runnerName: 'Summarizer',
  startText: 'Summarizing...',
  successText: 'Mined data summarized.',
  failureText: 'Summarizing failed.',
});

export const run = buildPresetRunner(
  {
    runExecutor,
    runMiner,
    runPlanner,
    runSummarizer,
    runSupervisor,
    runUser,
  },
  {
    async beforeCycle() {
      console.clear();
      displaySection('The goal', state.globalGoal);
      await displaySummary(state.previousSummary);
    },
    async afterCycle() {
      writeLog('State after cycle', JSON.stringify(state, null, 2));
    },
  },
);
