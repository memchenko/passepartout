import prompts from 'prompts';
import { state } from 'presets/universal/state';

export type PossibleOptions = 'confirm' | 'miner' | 'planner';

export const render = async (): Promise<PossibleOptions> => {
  const { decision } = state.results;
  const answer = await prompts({
    type: 'select',
    name: 'option',
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

  return answer.option;
};
