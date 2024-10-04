import { StringOutputParser } from '@langchain/core/output_parsers';
import { getExecutiveLLM } from 'lib/llm';
import { buildRulesString } from 'lib/misc';
import { prompt } from './prompt';
import { Input } from './types';

const miner = prompt.pipe(getExecutiveLLM()).pipe(new StringOutputParser());

export const run = async ({ task, action, actionResult, rules = '' }: Input): Promise<ActorResponse> => {
  return {
    response: await miner.invoke({ task, action, result: actionResult, rules: buildRulesString(rules) }),
  };
};
