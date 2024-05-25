import { START, END, StateGraph, StateGraphArgs } from '@langchain/langgraph';

import {
  PlanExecuteState,
  planStep,
  executeStep,
  replanStep,
  shouldEnd,
  userFeedbackStep,
  reflectStep,
  restartStep,
} from './nodes';

const planExecuteState: StateGraphArgs<PlanExecuteState>['channels'] = {
  input: {
    reducer: (a: string | null, b: string | null) => {
      return [...new Set([a, b].filter(Boolean))].join('\n');
    },
  },
  plan: {
    reducer: (a: string[], b: string[]) => {
      return b;
    },
    default: () => [],
  },
  pastSteps: {
    reducer: (a: string[], b: string[]) => {
      return [...new Set([...a, ...b])];
    },
    default: () => [],
  },
  reflection: {
    reducer: (a: string | null, b: string | null) => {
      return b ?? 'No recommendations.';
    },
  },
};

const workflow = new StateGraph<
  PlanExecuteState,
  Partial<PlanExecuteState>,
  'planner' | 'agent' | 'replan' | 'decideNext' | 'userFeedback' | 'reflect' | 'restart'
>({
  channels: planExecuteState,
});

workflow.addNode('planner', planStep);
workflow.addNode('agent', executeStep);
workflow.addNode('replan', replanStep);
workflow.addNode('reflect', reflectStep);
workflow.addNode('userFeedback', userFeedbackStep);
workflow.addNode('restart', restartStep);
workflow.addNode('decideNext', (state) => state);

workflow.addEdge(START, 'planner');
workflow.addEdge('planner', 'agent');
workflow.addEdge('agent', 'reflect');
workflow.addEdge('reflect', 'decideNext');
workflow.addEdge('userFeedback', 'replan');
workflow.addEdge('replan', 'agent');
workflow.addEdge('restart', 'planner');

workflow.addConditionalEdges('decideNext', shouldEnd, {
  finish: END,
  getInstructions: 'userFeedback',
  continue: 'replan',
  restart: 'restart',
});

export const analystAgent = workflow.compile();
