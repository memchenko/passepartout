import prompts from 'prompts';

export const render = async (): Promise<ActorType> => {
  const answer = await prompts({
    type: 'select',
    name: 'actor',
    message: 'Select assistant type',
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

  return answer.actor;
};
