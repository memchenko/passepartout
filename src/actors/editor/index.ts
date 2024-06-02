import { StringOutputParser } from '@langchain/core/output_parsers';
import { getExecutiveLLM } from 'lib/llm';
import { buildRulesString } from 'lib/misc';
import { prompt } from './prompt';
import { Input } from './types';

const editor = prompt.pipe(getExecutiveLLM()).pipe(new StringOutputParser());

export const run = async ({ content, updates, rules = '' }: Input): Promise<ActorResponse> => {
  return {
    response: await editor.invoke({ content, updates, rules: buildRulesString(rules) }),
  };
};
