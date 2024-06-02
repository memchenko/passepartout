export type State = {
  preset: WriterPreset | EditorPreset | ResearcherPreset | UniversalPreset | null;
  prompt: Prompt | null;
  numberOfTasks: number;
  rules: string | null;
  settings: Settings;
};

export type Prompt = {
  value: string;
  variables: Record<string, string[]> | null;
};

export type Preset<A extends PresetType, P extends {}> = {
  type: A;
  parameters: P | null;
};

export type WriterPreset = Preset<
  'writer',
  {
    paths: string[];
  }
>;
export type EditorPreset = Preset<
  'editor',
  {
    paths: string[];
  }
>;
export type ResearcherPreset = Preset<
  'researcher',
  {
    knowledgeSrc: KnowledgeSource;
  }
>;
export type UniversalPreset = Preset<
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
