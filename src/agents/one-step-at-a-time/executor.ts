import { ChatPromptTemplate } from '@langchain/core/prompts';
import { getExecutiveLLM, buildRunner, ErrorCodes } from './common';
import { executorTemplate } from './prompts';
import { assertIsNotNil } from 'helpers/type-guards';
import { formatToOpenAIFunction } from '@langchain/openai';
import { BaseFunctionCallOptions } from 'langchain/base_language';
import { mkdir, fileReader, writeMarkdownFile, codeRetriever, directoryTree } from 'tools/index';

const toolsPromise = Promise.all([mkdir, fileReader, writeMarkdownFile, codeRetriever, directoryTree]);

export const runExecutor = buildRunner(
  async (input: string) => {
    const tools = await toolsPromise;

    const functions = tools.map(formatToOpenAIFunction);
    const toolsFormatted = tools
      .map((tool) => {
        return `- ${tool.name}: ${tool.description}`;
      })
      .join(';\n');
    const llmOptions = { tools: functions, tool_choice: 'required' } as BaseFunctionCallOptions;
    const executor = ChatPromptTemplate.fromTemplate(executorTemplate).pipe(
      getExecutiveLLM().bind(llmOptions).withRetry({ stopAfterAttempt: 2 }),
    );

    const executorResponse = await executor.invoke({
      tools: toolsFormatted,
      action: input,
    });

    const toolCall = executorResponse.tool_calls?.[0];
    const tool = tools.find((tool) => tool.name === toolCall?.name);

    assertIsNotNil(tool, ErrorCodes.ToolFailed);
    assertIsNotNil(toolCall, ErrorCodes.ToolFailed);

    const result = await tool.invoke(toolCall.args);

    return result;
  },
  {
    runnerName: 'Executor',
    start: 'Executing...',
    success: 'Executed successfully.',
    failure: 'Execution failed.',
  },
);
