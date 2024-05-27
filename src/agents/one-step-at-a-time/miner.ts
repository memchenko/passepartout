import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { getCreativeLLM, buildRunner } from './common';
import { minerTemplate } from './prompts';

const miner = ChatPromptTemplate.fromTemplate(minerTemplate).pipe(getCreativeLLM()).pipe(new StringOutputParser());

export const runMiner = buildRunner(
  async (task: string, action: string, actionResult: string) => {
    return {
      response: await miner.invoke({ task, action, result: actionResult }),
    };
  },
  {
    runnerName: 'Miner',
    start: 'Mining...',
    success: 'Insights obtained.',
    failure: 'Mining failed.',
  },
);
