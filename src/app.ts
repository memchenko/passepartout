import prompts from 'prompts';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

import { iterate } from 'agents/documenter/index';

export const start = async () => {
  marked.use(markedTerminal() as any);

  const answer = await prompts({
    type: 'text',
    name: 'input',
    message: 'What do you want AI team to do?',
  });

  await iterate(answer.input);
};
