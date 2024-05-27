import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { getExecutiveLLM, buildRunner } from './common';
import { summarizerTemplate } from './prompts';

const summarizer = ChatPromptTemplate.fromTemplate(summarizerTemplate)
  .pipe(getExecutiveLLM())
  .pipe(new StringOutputParser());

export const runSummarizer = buildRunner(
  async ({
    task,
    action,
    minerResponse,
    previousSummary,
  }: {
    task: string;
    action: string;
    minerResponse: string;
    previousSummary: string;
  }) => {
    return {
      response: await summarizer.invoke({
        task,
        action,
        result: minerResponse,
        summary: previousSummary || 'No summary exists yet.',
      }),
    };
  },
  {
    runnerName: 'Summarizer',
    start: 'Summarizing...',
    success: 'Mined data summarized.',
    failure: 'Summarizing failed.',
  },
);
