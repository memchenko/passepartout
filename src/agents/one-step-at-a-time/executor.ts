import { ChatPromptTemplate } from '@langchain/core/prompts';
import { getExecutiveLLM, buildRunner, ErrorCodes } from './common';
import { executorTemplate } from './prompts';
import { assertIsNotNil } from 'helpers/type-guards';
import { formatToOpenAITool, ChatOpenAICallOptions } from '@langchain/openai';
import { mkdir, fileReader, writeMarkdownFile, codeRetriever, directoryTree } from 'tools/index';
import { writeLog } from 'helpers/log';

const toolsPromise = Promise.all([mkdir, fileReader, writeMarkdownFile, codeRetriever, directoryTree]);

export const runExecutor = buildRunner(
  async (input: string) => {
    const tools = await toolsPromise;

    const functions = tools.map(formatToOpenAITool);
    const toolsFormatted = tools
      .map((tool) => {
        return `- ${tool.name}: ${tool.description}`;
      })
      .join(';\n');
    const llmOptions: ChatOpenAICallOptions = { tools: functions, tool_choice: 'required' };
    const executor = ChatPromptTemplate.fromTemplate(executorTemplate).pipe(
      getExecutiveLLM().bind(llmOptions).withRetry({ stopAfterAttempt: 2 }),
    );

    const executorResponse = await executor.invoke({
      tools: toolsFormatted,
      action: input,
    });

    writeLog('Executor selected tool', JSON.stringify(executorResponse, null, 2));

    const toolCall = executorResponse.tool_calls?.[0];
    const tool = tools.find((tool) => tool.name === toolCall?.name);

    assertIsNotNil(tool, ErrorCodes.ToolFailed);
    assertIsNotNil(toolCall, ErrorCodes.ToolFailed);

    writeLog('Tool call', JSON.stringify(toolCall, null, 2));

    return tool.invoke(toolCall.args);
  },
  {
    runnerName: 'Executor',
    start: 'Executing...',
    success: 'Executed successfully.',
    failure: 'Execution failed.',
  },
);
