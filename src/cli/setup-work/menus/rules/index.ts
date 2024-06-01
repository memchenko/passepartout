import prompts from 'prompts';
import { formatTextAsConfirmed } from 'cli/setup-work/common';
import { state } from 'cli/setup-work/state';

export type PossibleOptions = 'write' | 'select' | 'load' | 'back';

export const render = async (): Promise<PossibleOptions> => {
  const answer = await prompts({
    type: 'select',
    name: 'option',
    message: formatTextAsConfirmed('Select how to specify rules', state.rules),
    choices: [
      {
        title: 'Write',
        value: 'write',
      },
      // {
      //   title: 'Select existing',
      //   value: 'select',
      // },
      {
        title: 'Load from file',
        value: 'load',
      },
      {
        title: 'Go back',
        value: 'back',
      },
    ],
  });

  return answer.option;
};
