import { StringOutputParser } from '@langchain/core/output_parsers';
import { getExecutiveLLM } from 'lib/llm';
import { prompt } from './prompt';
import { Input } from './types';

const summarizer = prompt.pipe(getExecutiveLLM()).pipe(new StringOutputParser());

export const run = async ({ task, action, minerResponse, previousSummary }: Input): Promise<ActorResponse> => {
  return {
    response: await summarizer.invoke({
      task,
      action,
      result: minerResponse,
      summary: previousSummary || 'No summary exists yet.',
    }),
  };
};
