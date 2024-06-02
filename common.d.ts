declare type PresetType = 'universal' | 'writer' | 'editor' | 'researcher';

declare type Actors = 'planner' | 'executor' | 'supervisor' | 'user' | 'miner' | 'summarizer';

declare type HTTPProtocol = 'http' | 'https';

declare type Url = `${HTTPProtocol}://${string}`;

declare type Space = 'knowledge' | 'workspace';

declare type SpacePath = `${Space}://${string}`;

declare type ActorResponse = {
  response: string;
  successMessage?: string;
};

declare type ActorInput = {
  rules?: string;
};
