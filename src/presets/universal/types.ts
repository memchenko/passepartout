export type State = {
  finished: boolean;
  globalGoal: string;
  previousSummary: string;
  errors: string[];
  cycles: number;
  startNextCycleFrom: 'planner' | 'miner';
  previousActionRequested: string | null;
  results: {
    planning: string;
    execution: string;
    decision: string;
    mining: string;
    summarizing: string;
  };
};
