import { getExecutiveLLM } from 'lib/llm';
import { buildRulesString } from 'lib/misc';
import { prompt } from './prompt';
import { Input } from './types';

const supervisor = prompt.pipe(
  getExecutiveLLM().withStructuredOutput({
    type: 'object',
    properties: {
      next: {
        type: 'string',
        enum: ['miner', 'planner', 'user'],
      },
    },
  }),
);

export const run = async ({ goal, latestAction, rules = '' }: Input): Promise<ActorResponse> => {
  const supervisorResponse: { next: string } = await supervisor.invoke({
    goal,
    latestAction,
    rules: buildRulesString(rules),
  });

  let next: string = 'user';

  if (supervisorResponse) {
    next = supervisorResponse.next;
  }

  return {
    response: next,
    successMessage: next,
  };
};
