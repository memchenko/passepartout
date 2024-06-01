import prompts from 'prompts';
import { state } from 'cli/setup-work/state';

export type PossibleOptions = 'cycles' | 'back';

export const render = async (): Promise<PossibleOptions> => {
  const answer = await prompts({
    type: 'select',
    name: 'option',
    message: 'Select knowledge source',
    choices: [
      {
        title: `Check after # of cycles (current: ${state.settings.controlFrequency})`,
        value: 'cycles',
      },
      {
        title: 'Go back',
        value: 'back',
      },
    ],
  });

  return answer.option;
};
