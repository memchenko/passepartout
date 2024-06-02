import * as executor from 'actors/executor';
import * as miner from 'actors/miner';
import * as planner from 'actors/planner';
import * as supervisor from 'actors/supervisor';
import * as summarizer from 'actors/summarizer';
import { wrapActorRunner } from './common';
import { buildPresetRunner } from 'presets/universal';

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

export const run = buildPresetRunner({
  runExecutor,
  runMiner,
  runPlanner,
  runSummarizer,
  runSupervisor,
  runUser: () => {},
});
