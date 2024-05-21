import prompts from 'prompts';

import { buildAgent as buildManager, tools as managerTools } from 'agents/manager';
import { buildAgent as buildAnalyst } from 'agents/analyst';
import { onMessageToAgent } from 'services/notifications/helpers';
import { formatMessage } from 'helpers/formatting';
import { handleAgentAction } from 'helpers/agents';

const main = async () => {
  const [manager] = await Promise.all([buildManager(), buildAnalyst()]);

  const answer = await prompts({
    type: 'text',
    name: 'input',
    message: 'What do you want AI team to do?',
  });

  onMessageToAgent('manager', (message) => {
    manager.invoke(
      {
        input: formatMessage(message),
        tools: managerTools,
      },
      {
        configurable: {
          sessionId: message.signer,
        },
        callbacks: [
          {
            handleAgentAction: handleAgentAction.bind(null, 'manager'),
          },
        ],
      },
    );
  });

  const stream = await manager.stream(
    {
      input: answer.input,
      tools: managerTools,
      chat_history: [],
    },
    {
      configurable: {
        sessionId: 'user',
      },
      callbacks: [
        {
          handleAgentAction: handleAgentAction.bind(null, 'manager'),
          handleAgentEnd() {
            process.exit(0);
          },
        },
      ],
    },
  );

  for await (const chunk of stream) {
    if (chunk.content) {
      process.stdout.write(chunk.content);
    }
  }
};

main();
