import * as prompt from 'cli/setup-work/menus/prompt';
import { state } from 'cli/setup-work/state';
import { render } from 'cli/setup-work/common';
import { runTerminalEditor } from 'lib/terminalEditor';
import { assertIsNotNil } from 'lib/type-guards';

export const processPrompt = async (): Promise<void> => {
  let option: prompt.PossibleOptions;

  do {
    option = await render(prompt);

    switch (option) {
      case 'write': {
        const value = await runTerminalEditor();

        state.prompt = { value, variables: null };
        break;
      }
      case 'variables': {
        const variablesJson = prompt.buildVariablesJson();
        let json = JSON.stringify(variablesJson, null, 2);
        json = await runTerminalEditor(json);
        json = JSON.parse(json);

        assertIsNotNil(state.prompt, 'Prompt was not specified.');

        state.numberOfTasks = Object.values(json).reduce((acc, values) => {
          return acc < values.length ? values.length : acc;
        }, Infinity);
        state.prompt.variables = JSON.parse(json);
        break;
      }
    }
  } while (option !== 'back');
};
