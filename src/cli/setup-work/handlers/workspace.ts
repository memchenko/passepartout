import { state } from 'cli/setup-work/state';
import { UniversalPreset } from 'cli/setup-work/types';
import { runTerminalEditor } from 'lib/terminalEditor';
import { assertIsNotNil } from 'lib/type-guards';

export const processWorkspace = async (): Promise<void> => {
  const value = await runTerminalEditor();
  assertIsNotNil(state.preset);

  const params = state.preset.parameters as UniversalPreset['parameters'];

  state.preset.parameters = {
    knowledgeSrc: params?.knowledgeSrc ?? null,
    workspaceFolder: value.trim(),
  };
};
