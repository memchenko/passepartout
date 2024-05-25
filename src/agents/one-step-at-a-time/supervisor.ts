import { ChatPromptTemplate } from '@langchain/core/prompts';
import { getExecutiveLLM, buildRunner } from './common';
import { supervisorTemplate } from './prompts';

const supervisor = ChatPromptTemplate.fromTemplate(supervisorTemplate).pipe(
  getExecutiveLLM().withStructuredOutput({
    type: 'object',
    properties: {
      next: {
        type: 'string',
        enum: ['miner', 'planner'],
      },
    },
  }),
);

export const runSupervisor = buildRunner(
  async (goal: string, latestAction: string) => {
    const supervisorResponse: { next: string } = await supervisor.invoke({ goal, latestAction });

    let next: string = 'user';

    if (supervisorResponse) {
      next = supervisorResponse.next;
    }

    return next;
  },
  {
    runnerName: 'Supervisor',
    start: "Diciding who's next...",
    success: 'Next actor is selected.',
    failure: 'Decision failed.',
  },
);
