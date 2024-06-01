import * as knowledgeSrc from 'cli/setup-work/menus/knowledge-src';
import { render } from 'cli/setup-work/common';
import { state } from 'cli/setup-work/state';
import { UniversalActor } from 'cli/setup-work/types';
import { runTerminalEditor } from 'helpers/terminalEditor';
import { assertIsNotNil } from 'helpers/type-guards';

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
        assertIsNotNil(state.actor, 'Actor was not specified.');
        state.actor.parameters = {
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
  assertIsNotNil(state.actor, 'Actor was not specified.');

  const params = (state.actor.parameters ?? {}) as Exclude<UniversalActor['parameters'], null>;

  params.knowledgeSrc = { type: 'web', value };
  state.actor.parameters = params;
};

const setFileSystemSource = async (value: string, type: 'file' | 'directory') => {
  assertIsNotNil(state.actor, 'Actor was not specified.');

  const params = (state.actor.parameters ?? {}) as Exclude<UniversalActor['parameters'], null>;

  params.knowledgeSrc = { type, value };
  state.actor.parameters = params;
};
