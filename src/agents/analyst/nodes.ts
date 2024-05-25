import prompts from 'prompts';

import { buildExecutionAgent } from './executionAgent';
import { planner } from './planner';
import { replanner } from './replanner';
import { buildReflector } from './reflector';
import { getToolsList } from './prompts';
import { formatSteps } from './utils';
import { reflectorTools } from './tools';

export type PlanExecuteState = {
  input: string | null;
  plan: Array<string>;
  pastSteps: Array<string>;
  reflection: string | null;
};

export async function executeStep(state: PlanExecuteState): Promise<Partial<PlanExecuteState>> {
  const agentExecutor = await buildExecutionAgent();
  const tasks = state.plan;
  const context = [];

  for (const task of tasks) {
    try {
      const agentResponse = await agentExecutor.invoke({
        task,
        context: context.join('\n------------------\n'),
        chat_history: [],
      });
      context.push(agentResponse?.output);
    } catch {
      continue;
    }
  }

  const newState = { ...state, pastSteps: context };
  console.log('CURRENT STATE');
  console.log(JSON.stringify(newState, null, 2));
  return newState;
}

export async function planStep(state: PlanExecuteState): Promise<Partial<PlanExecuteState>> {
  const plan = await planner.invoke({
    objective: state.input ?? 'Not defined.',
    toolsList: await getToolsList(),
  });

  if (!('steps' in plan)) {
    return { ...state, plan: [] };
  }

  process.stdout.write(JSON.stringify(plan.steps, null, 2));
  process.stdout.write('\n');

  const newState = { ...state, plan: formatSteps(plan.steps as string[]) };
  console.log('CURRENT STATE');
  console.log(JSON.stringify(newState, null, 2));
  return newState;
}

export async function replanStep(state: PlanExecuteState): Promise<Partial<PlanExecuteState>> {
  const output = await replanner.invoke({
    input: state.input,
    plan: state.plan ? state.plan.join('\n') : '',
    pastSteps: state.pastSteps.join('\n'),
    toolsList: await getToolsList(),
    reflection: state.reflection ?? 'No recommendations.',
  });

  if (!('steps' in output)) {
    const newState = { ...state, plan: [] };
    console.log('CURRENT STATE');
    console.log(JSON.stringify(newState, null, 2));
    return newState;
  }

  process.stdout.write(JSON.stringify(output.steps, null, 2));
  process.stdout.write('\n');

  const newState = { ...state, plan: formatSteps(output.steps as string[]) };
  console.log('CURRENT STATE');
  console.log(JSON.stringify(newState, null, 2));

  return newState;
}

export async function shouldEnd() {
  process.stdout.write('\n---------------\n');
  const answer = await prompts({
    type: 'select',
    name: 'nextAction',
    message: 'Should we continue?',
    choices: [
      {
        title: 'Iterate',
        value: 'continue',
      },
      {
        title: 'Instruct',
        value: 'getInstructions',
      },
      {
        title: 'New objective',
        value: 'restart',
      },
      {
        title: 'Finish',
        value: 'finish',
      },
    ],
  });

  return String(answer.nextAction);
}

let objectivesCounter = 1;
export async function userFeedbackStep(state: PlanExecuteState): Promise<Partial<PlanExecuteState>> {
  const answer = await prompts({
    type: 'text',
    name: 'details',
    message: 'Provide details',
  });

  objectivesCounter++;

  let input = state.input ? `${state.input}\n\n` : '';
  input += `Objective #${objectivesCounter}: ${answer.details}`;

  const newState = {
    ...state,
    reflection: null,
    input,
  };
  console.log('CURRENT STATE');
  console.log(JSON.stringify(newState, null, 2));

  return newState;
}

export async function reflectStep(state: PlanExecuteState): Promise<Partial<PlanExecuteState>> {
  process.stdout.write('\n---------------\nREFLECTING\n');

  const reflector = await buildReflector();
  const result = await reflector.invoke({
    input: state.input ?? 'Not defined.',
    plan: formatSteps(state.plan).join('\n') ?? 'Unplanned yet.',
    pastSteps: formatSteps(state.pastSteps).join('\n'),
    tools: await Promise.all(reflectorTools),
    chat_history: [],
  });

  const newState = { ...state, reflection: result?.output ?? 'No recommendations.' };
  console.log('CURRENT STATE');
  console.log(JSON.stringify(newState, null, 2));

  return newState;
}

export async function restartStep(): Promise<PlanExecuteState> {
  const answer = await prompts({
    type: 'text',
    name: 'objective',
    message: 'What do you want to do next?',
  });

  return {
    input: answer.objective,
    plan: [],
    pastSteps: [],
    reflection: null,
  };
}
