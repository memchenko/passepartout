import cloneDeep from 'lodash/cloneDeep';
import { State } from './types';

const initialState: State = {
  finished: false,
  globalGoal: '',
  previousSummary: '',
  errors: [] as string[],
  cycles: 0,
  startNextCycleFrom: 'planner',
  previousActionRequested: null,
  results: {
    planning: '',
    execution: '',
    decision: '',
    mining: '',
    summarizing: '',
  },
};

export const state = cloneDeep(initialState);

export const resetState = () => {
  Object.assign(state, cloneDeep(initialState));
};
