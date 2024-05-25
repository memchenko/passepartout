import { ChatOpenAI } from '@langchain/openai';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';

import { plannerPrompt } from './prompts';
import { planFunction } from './tools';

const model = new ChatOpenAI({
  modelName: 'gpt-4-turbo',
  apiKey: process.env.API_KEY,
  temperature: 0.8,
}).bind({
  functions: [planFunction],
  function_call: planFunction,
});
const parserSingle = new JsonOutputFunctionsParser({ argsOnly: true });

export const planner = plannerPrompt.pipe(model).pipe(parserSingle);
