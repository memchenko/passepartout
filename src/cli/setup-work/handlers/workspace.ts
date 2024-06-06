import { state } from 'cli/setup-work/state';
import { UniversalPreset } from 'cli/setup-work/types';
import { runTerminalEditor } from 'lib/terminalEditor';
import { WORKSPACE_SPACE } from 'lib/constants';
import { workspaceSpacePathSchema } from 'lib/schemas';
import { assertIsNotNil, assertMatchSchema } from 'lib/type-guards';

export const processWorkspace = async (): Promise<void> => {
  const value = `${WORKSPACE_SPACE}://${await runTerminalEditor()}`;
  assertIsNotNil(state.preset);
  assertMatchSchema<SpacePath>(workspaceSpacePathSchema, value);

  const params = state.preset.parameters as UniversalPreset['parameters'];

  state.preset.parameters = {
    knowledgeSrc: params?.knowledgeSrc ?? null,
    workspaceFolder: value,
  };
};
