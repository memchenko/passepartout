import * as knowledgeSrc from 'cli/setup-work/menus/knowledge-src';
import { render } from 'cli/setup-work/common';
import { state } from 'cli/setup-work/state';
import { UniversalPreset } from 'cli/setup-work/types';
import { runTerminalEditor } from 'lib/terminalEditor';
import { assertIsNotNil } from 'lib/type-guards';

export const processKnowledgeSrc = async (): Promise<void> => {
  let option: knowledgeSrc.PossibleOptions;

  do {
    option = await render(knowledgeSrc);

    switch (option) {
      case 'web': {
        setWebSource(await runTerminalEditor('https://'));
        break;
      }
      case 'file':
      case 'directory': {
        setFileSystemSource(await runTerminalEditor(), option);
        break;
      }
      case 'user': {
        assertIsNotNil(state.preset, 'Actor was not specified.');
        state.preset.parameters = {
          knowledgeSrc: {
            type: 'user',
            value: null,
          },
        };
        break;
      }
    }
  } while (option !== 'back');
};

const setWebSource = async (value: string) => {
  assertIsNotNil(state.preset, 'Actor was not specified.');

  const params = (state.preset.parameters ?? {}) as Exclude<UniversalPreset['parameters'], null>;

  params.knowledgeSrc = { type: 'web', value: value.trim() };
  state.preset.parameters = params;
};

const setFileSystemSource = async (value: string, type: 'file' | 'directory') => {
  assertIsNotNil(state.preset, 'Actor was not specified.');

  const params = (state.preset.parameters ?? {}) as Exclude<UniversalPreset['parameters'], null>;

  params.knowledgeSrc = { type, value: value.trim() };
  state.preset.parameters = params;
};
