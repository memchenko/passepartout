import prompts from 'prompts';

export const render = async (): Promise<PresetType> => {
  const answer = await prompts({
    type: 'select',
    name: 'preset',
    message: 'Select preset to execute',
    choices: [
      {
        title: 'Universal',
        value: 'universal',
      },
      {
        title: 'Writer',
        value: 'writer',
      },
      {
        title: 'Editor',
        value: 'editor',
      },
      {
        title: 'Researcher',
        value: 'researcher',
      },
    ],
  });

  return answer.preset;
};
