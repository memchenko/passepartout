import { StringOutputParser } from '@langchain/core/output_parsers';
import { counted } from 'lib/formatting';
import { getCreativeLLM } from 'lib/llm';
import { buildRulesString } from 'lib/misc';
import { prompt } from './prompt';
import { Input } from './types';

export const planner = prompt.pipe(getCreativeLLM()).pipe(new StringOutputParser());

export const run = async ({
  task,
  insights,
  cycle,
  errors,
  rules = '',
  previousAction,
}: Input): Promise<ActorResponse> => {
  return {
    response: await planner.invoke({
      task,
      cycle: String(cycle),
      insights: insights || 'There are no insights yet',
      error: errors.length > 0 ? errors.map(counted).join('\n') : 'No errors.',
      rules: buildRulesString(rules),
      action: previousAction || "You haven't done any action yet",
    }),
  };
};
