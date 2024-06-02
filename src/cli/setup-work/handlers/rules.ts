import fs from 'node:fs';
import { promisify } from 'node:util';
import * as rulesMenu from 'cli/setup-work/menus/rules';
import * as pathsMenu from 'cli/setup-work/menus/paths';
import { state } from 'cli/setup-work/state';
import { render } from 'cli/setup-work/common';
import { runTerminalEditor } from 'lib/terminalEditor';

const readFileAsync = promisify(fs.readFile);

export const processRules = async () => {
  let rulesOption: rulesMenu.PossibleOptions;

  do {
    rulesOption = await render(rulesMenu);

    switch (rulesOption) {
      case 'write': {
        state.rules = await runTerminalEditor();
      }
      case 'load': {
        const paths = await render(pathsMenu);
        const contents = await Promise.all(paths.map((path) => readFileAsync(path, 'utf-8')));
        state.rules = contents.join('\n');
      }
    }
  } while (rulesOption !== 'back');
};
