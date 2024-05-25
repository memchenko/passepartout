import { ChatOpenAI } from '@langchain/openai';
import { createOpenAIFnRunnable } from 'langchain/chains/openai_functions';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';

import { replannerPrompt } from './prompts';
import { planFunction } from './tools';

const parser = new JsonOutputFunctionsParser();

export const replanner = createOpenAIFnRunnable({
  functions: [planFunction],
  outputParser: parser,
  llm: new ChatOpenAI({
    modelName: 'gpt-4-turbo',
    apiKey: process.env.API_KEY,
    temperature: 0.8,
  }),
  prompt: replannerPrompt,
});
