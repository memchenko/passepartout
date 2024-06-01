import prompts from 'prompts';

export const render = async (): Promise<string[]> => {
  const paths: string[] = [];
  let shouldContinue = true;

  while (shouldContinue) {
    const answer = await prompts([
      {
        type: 'text',
        name: 'path',
        message: `Specify path (absolute or relative to ${process.cwd()})`,
      },
      {
        type: 'confirm',
        name: 'next',
        message: 'Would you like to add more paths?',
      },
    ]);

    paths.push(answer.path);
    shouldContinue = answer.next;
  }

  return paths;
};
