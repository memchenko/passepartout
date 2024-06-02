import cloneDeep from 'lodash/cloneDeep';

const initialConfig = {
  controlFrequency: 3,
  rules: {
    planner: '',
    executor: '',
    supervisor: '',
    summarizer: '',
    miner: '',
  },
};

export const config = cloneDeep(initialConfig);

export const resetConfig = () => {
  Object.assign(config, cloneDeep(initialConfig));
};
