import prompts from 'prompts';

export type PossibleOptions = 'continue' | 'goal' | 'insight' | 'finish';

export const render = async (): Promise<PossibleOptions> => {
  const answer = await prompts({
    type: 'select',
    name: 'option',
    message: 'Choose action:',
    choices: [
      { title: 'Continue', value: 'continue' },
      { title: 'Edit goal', value: 'goal' },
      { title: 'Edit insights', value: 'insight' },
      { title: 'Finish', value: 'finish' },
    ],
  });

  return answer.option;
};
