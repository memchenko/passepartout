import prompts from 'prompts';
import { state } from './state';
import { closeLogStream, writeLog } from 'helpers/log';
import { isNotNil } from 'helpers/type-guards';

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
      return runEditInsight(flow);
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
  state.previousSummary = '';
  state.cycles = 0;
  state.startNextCycleFrom = 'planner';
};

const runContinue = async (flow: Record<string, (...args: string[]) => Promise<unknown>>) => {
  const { decision } = state.results;
  const answer = await prompts({
    type: 'select',
    name: 'next',
    message: `The assistant selected '${decision}' to be next. What do you think?`,
    choices: [
      {
        title: 'Confirm',
        value: 'confirm',
      },
      {
        title: 'Miner',
        value: 'miner',
      },
      {
        title: 'Planner',
        value: 'planner',
      },
    ],
  });

  const next = answer.next === 'confirm' ? decision : answer.next;
  const fn = flow[next];

  if (isNotNil(fn)) {
    state.startNextCycleFrom = next;
  } else {
    writeLog('Inexistent flow node', state.results.decision, 'warn');
    state.startNextCycleFrom = 'planner';
  }
};

const runEditInsight = async (flow: Record<string, (...args: string[]) => Promise<unknown>>) => {
  state.previousSummary = (
    await prompts({
      type: 'text',
      name: 'response',
      message: 'Updated insight',
    })
  ).response;
  state.startNextCycleFrom = 'planner';
};
