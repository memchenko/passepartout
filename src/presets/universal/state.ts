import cloneDeep from 'lodash/cloneDeep';
import { State } from './types';

const initialState: State = {
  globalGoal: '',
  previousSummary: '',
  errors: [] as string[],
  cycles: 0,
  startNextCycleFrom: 'planner',
  results: {
    planning: '',
    execution: '',
    decision: '',
    mining: '',
    summarizing: '',
  },
  settings: {
    controlFrequency: 3,
  },
};

export const state = cloneDeep(initialState);

export const resetState = () => {
  Object.assign(state, initialState);
};
