import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { counted } from 'helpers/formatting';
import { getCreativeLLM, buildRunner } from './common';
import { plannerTemplate } from './prompts';

export const planner = ChatPromptTemplate.fromTemplate(plannerTemplate)
  .pipe(getCreativeLLM())
  .pipe(new StringOutputParser());

export const runPlanner = buildRunner(
  async ({ task, insights, cycle, errors }: { task: string; insights: string; cycle: number; errors: string[] }) => {
    return {
      response: await planner.invoke({
        task,
        cycle: String(cycle),
        insights: insights || 'There are no insights yet',
        error: errors.length > 0 ? errors.map(counted).join('\n') : 'No errors.',
      }),
    };
  },
  {
    runnerName: 'Planner',
    start: 'Planning...',
    success: 'Step planned.',
    failure: 'Planning failed.',
  },
);
