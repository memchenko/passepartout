import prompts from 'prompts';
import { state } from './common';
import { closeLogStream } from 'helpers/log';

export const runUser = async (flow: Record<string, (...args: string[]) => Promise<unknown>>) => {
  const answer = await prompts({
    type: 'select',
    name: 'action',
    message: 'Choose action:',
    choices: [
      { title: 'Continue', value: 'continue' },
      { title: 'Edit goal', value: 'goal' },
      { title: 'Edit insights', value: 'insight' },
      { title: 'Finish', value: 'finish' },
    ],
  });

  switch (answer.action) {
    case 'finish': {
      return runFinish();
    }
    case 'goal': {
      return runEditGoal();
    }
    case 'insight': {
      return runEditInsight();
    }
    case 'continue': {
      return runContinue(flow);
    }
    default: {
      throw new Error(`Unknown user selected action: ${answer.action}`);
    }
  }
};

const runFinish = () => {
  closeLogStream();
  process.exit(0);
};

const runEditGoal = async () => {
  state.globalGoal = (
    await prompts({
      type: 'text',
      name: 'response',
      message: 'New goal',
    })
  ).response;
};

const runContinue = async (flow: Record<string, (...args: string[]) => Promise<unknown>>) => {
  await flow[state.results.decision]();
};

const runEditInsight = async () => {
  state.previousSummary = (
    await prompts({
      type: 'text',
      name: 'response',
      message: 'New goal',
    })
  ).response;
};
