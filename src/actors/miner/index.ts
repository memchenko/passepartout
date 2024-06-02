import { StringOutputParser } from '@langchain/core/output_parsers';
import { getCreativeLLM } from 'lib/llm';
import { prompt } from './prompt';
import { Input } from './types';

const miner = prompt.pipe(getCreativeLLM()).pipe(new StringOutputParser());

export const run = async ({ task, action, actionResult }: Input): Promise<ActorResponse> => {
  return {
    response: await miner.invoke({ task, action, result: actionResult }),
  };
};
