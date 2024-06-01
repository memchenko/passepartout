import { state } from 'cli/setup-work/state';
import { UniversalActor } from 'cli/setup-work/types';
import { runTerminalEditor } from 'helpers/terminalEditor';
import { workspaceSpacePathSchema, WORKSPACE_SPACE } from 'helpers/types';
import { assertIsNotNil, assertMatchSchema } from 'helpers/type-guards';

export const processWorkspace = async (): Promise<void> => {
  const value = `${WORKSPACE_SPACE}://${await runTerminalEditor()}`;
  assertIsNotNil(state.actor);
  assertMatchSchema<SpacePath>(workspaceSpacePathSchema, value);

  const params = state.actor.parameters as UniversalActor['parameters'];

  state.actor.parameters = {
    knowledgeSrc: params?.knowledgeSrc ?? null,
    workspaceFolder: value,
  };
};
