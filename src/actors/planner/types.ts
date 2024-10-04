export interface Input extends ActorInput {
  task: string;
  insights: string;
  cycle: number;
  errors: string[];
  previousAction: string | null;
}
