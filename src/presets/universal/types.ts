export type State = {
  globalGoal: string;
  previousSummary: string;
  errors: string[];
  cycles: number;
  startNextCycleFrom: 'planner' | 'miner';
  results: {
    planning: string;
    execution: string;
    decision: string;
    mining: string;
    summarizing: string;
  };
  settings: {
    controlFrequency: number;
  };
};
