import { formatToOpenAITool, ChatOpenAICallOptions } from '@langchain/openai';
import { assertIsNotNil } from 'lib/type-guards';
import { mkdir, fileReader, writeFile, directoryTree, updateFile } from 'tools/index';
import { writeLog } from 'lib/log';
import { getExecutiveLLM } from 'lib/llm';
import { prompt } from './prompt';
import { Input } from './types';

const toolsPromise = Promise.all([mkdir, fileReader, writeFile, directoryTree, updateFile]);

export const run = async (input: Input): Promise<ActorResponse> => {
  const tools = await toolsPromise;

  const functions = tools.map(formatToOpenAITool);
  const toolsFormatted = tools
    .map((tool) => {
      return `- ${tool.name}: ${tool.description}`;
    })
    .join(';\n');
  const llmOptions: ChatOpenAICallOptions = { tools: functions, tool_choice: 'required' };
  const executor = prompt.pipe(getExecutiveLLM().bind(llmOptions).withRetry({ stopAfterAttempt: 2 }));

  const executorResponse = await executor.invoke({
    tools: toolsFormatted,
    action: input,
  });

  writeLog('Executor selected tool', JSON.stringify(executorResponse, null, 2));

  const toolCall = executorResponse.tool_calls?.[0];
  const tool = tools.find((tool) => tool.name === toolCall?.name);

  assertIsNotNil(tool, 'Action execution failed. Try again');
  assertIsNotNil(toolCall, 'Action execution failed. Try again');

  writeLog('Tool call', JSON.stringify(toolCall, null, 2));

  return {
    response: await tool.invoke(toolCall.args),
    successMessage: tool.name,
  };
};
