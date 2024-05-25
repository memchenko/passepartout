import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';

import { reflectorPrompt } from './prompts';
import { reflectorTools } from './tools';

const model = new ChatOpenAI({
  modelName: 'gpt-4-turbo',
  apiKey: process.env.API_KEY,
  temperature: 0.4,
});

let agent: Awaited<ReturnType<typeof createOpenAIToolsAgent>>;
let agentExecutor: AgentExecutor;

export const buildReflector = async () => {
  const tools = await Promise.all(reflectorTools);

  if (agentExecutor !== undefined) {
    return agentExecutor;
  }

  agent = await createOpenAIToolsAgent({
    llm: model,
    prompt: reflectorPrompt,
    tools,
  });
  agentExecutor = AgentExecutor.fromAgentAndTools({
    agent,
    tools,
  });

  return agentExecutor;
};
