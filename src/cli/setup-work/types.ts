export type State = {
  actor: WriterActor | EditorActor | ResearcherActor | UniversalActor | null;
  prompt: Prompt | null;
  numberOfTasks: number;
  rules: string | null;
  settings: Settings;
};

export type Prompt = {
  value: string;
  variables: Record<string, string[]> | null;
};

export type Actor<A extends ActorType, P extends {}> = {
  type: A;
  parameters: P | null;
};

export type WriterActor = Actor<
  'writer',
  {
    paths: string[];
  }
>;
export type EditorActor = Actor<
  'editor',
  {
    paths: string[];
  }
>;
export type ResearcherActor = Actor<
  'researcher',
  {
    knowledgeSrc: KnowledgeSource;
  }
>;
export type UniversalActor = Actor<
  'universal',
  {
    knowledgeSrc: KnowledgeSource | null;
    workspaceFolder: string | null;
  }
>;

export type KnowledgeSource = {
  type: 'file' | 'directory' | 'web' | 'user' | 'actor';
  value: string | null;
};

export type Settings = {
  controlFrequency: number;
};
