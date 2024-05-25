import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createOpenAIToolsAgent, AgentExecutor } from 'langchain/agents';

import { executionAgentPrompt } from './prompts';
import { executorTools } from './tools';

const llm = new ChatOpenAI({
  modelName: 'gpt-4-turbo',
  apiKey: process.env.API_KEY,
  temperature: 0.1 /*verbose: true*/,
});
let agent: Awaited<ReturnType<typeof createOpenAIToolsAgent>>;
let agentExecutor: AgentExecutor;

export const buildExecutionAgent = async () => {
  if (agentExecutor !== undefined) {
    return agentExecutor;
  }

  const tools = await executorTools;

  agent = await createOpenAIToolsAgent({
    llm,
    tools,
    prompt: executionAgentPrompt,
  });

  agentExecutor = AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    // verbose: true,
  });

  return agentExecutor;
};
