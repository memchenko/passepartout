import prompts from 'prompts';
import { Object } from 'ts-toolbelt';
import { state } from 'cli/setup-work/state';
import { assertPreset } from 'cli/setup-work/guards';
import { formatTextAsConfirmed } from 'cli/setup-work/common';
import { EditorPreset, ResearcherPreset, UniversalPreset, WriterPreset } from 'cli/setup-work/types';
import { buildConfig } from './common';

export type PossibleOptions =
  | 'prompt'
  | 'rules'
  | 'settings'
  | 'start'
  | 'paths'
  | 'knowledgeSrc'
  | 'workspace'
  | 'back';

export const render = async (): Promise<PossibleOptions> => {
  const { preset } = state;
  assertPreset(preset);

  const config = promptsConfigs[preset.type];
  const answer = await prompts(buildConfig(config()));

  return answer.option;
};

const promptsConfigs: Record<PresetType, () => Object.Partial<prompts.PromptObject, 'deep'>> = {
  writer: () => {
    const { preset } = state;
    assertPreset<WriterPreset>(preset, 'writer');

    return {
      choices: [
        {
          title: formatTextAsConfirmed('Specify path to write to *', preset.parameters?.paths),
          value: 'paths',
        },
      ],
    };
  },
  editor: () => {
    const { preset } = state;
    assertPreset<EditorPreset>(preset, 'editor');

    return {
      choices: [
        {
          title: formatTextAsConfirmed('Specify path of file to edit *', preset.parameters?.paths),
          value: 'paths',
        },
      ],
    };
  },
  researcher: () => {
    const { preset } = state;
    assertPreset<ResearcherPreset>(preset, 'researcher');

    return {
      choices: [
        {
          title: formatTextAsConfirmed('Specify knowledge source *', preset.parameters?.knowledgeSrc),
          value: 'knowledgeSrc',
        },
      ],
    };
  },
  universal: () => {
    const { preset } = state;
    assertPreset<UniversalPreset>(preset, 'universal');

    return {
      choices: [
        {
          title: formatTextAsConfirmed('Specify knowledge source *', preset.parameters?.knowledgeSrc),
          value: 'knowledgeSrc',
        },
        {
          title: formatTextAsConfirmed('Specify workspace folder *', preset.parameters?.workspaceFolder),
          value: 'workspace',
        },
      ],
    };
  },
};
