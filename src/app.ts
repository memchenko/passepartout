import prompts from 'prompts';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

import { iterate } from 'agents/one-step-at-a-time/index';

marked.use(markedTerminal() as any);

const main = async () => {
  const answer = await prompts({
    type: 'text',
    name: 'input',
    message: 'What do you want AI team to do?',
  });

  await iterate(answer.input);
};

main();
