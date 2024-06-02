import cloneDeep from 'lodash/cloneDeep';
import { State } from './types';

const initialState: State = {
  preset: null,
  prompt: null,
  numberOfTasks: 1,
  rules: null,
  settings: {
    controlFrequency: -1,
  },
};

export const state = cloneDeep(initialState);

export const resetState = () => {
  Object.assign(state, initialState);
};
