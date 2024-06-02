import { StringOutputParser } from '@langchain/core/output_parsers';
import { getCreativeLLM } from 'lib/llm';
import { buildRulesString } from 'lib/misc';
import { prompt } from './prompt';
import { Input } from './types';

const writer = prompt.pipe(getCreativeLLM()).pipe(new StringOutputParser());

export const run = async (input: Input): Promise<ActorResponse> => {
  const { goal, rules = '' } = input;

  return { response: await writer.invoke({ goal, rules: buildRulesString(rules) }) };
};
