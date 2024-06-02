import { ChatOpenAI } from '@langchain/openai';

export const getCreativeLLM = () =>
  new ChatOpenAI({
    modelName: 'gpt-4o',
    apiKey: process.env.API_KEY,
    temperature: 0.8,
  });

export const getExecutiveLLM = () =>
  new ChatOpenAI({
    modelName: 'gpt-4o',
    apiKey: process.env.API_KEY,
    temperature: 0.2,
  });
