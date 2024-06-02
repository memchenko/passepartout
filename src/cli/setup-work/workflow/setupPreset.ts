import * as presetMenu from 'cli/setup-work/menus/preset-menu';
import { processPrompt } from 'cli/setup-work/handlers/prompt';
import { processKnowledgeSrc } from 'cli/setup-work/handlers/knowledgeSrc';
import { processWorkspace } from 'cli/setup-work/handlers/workspace';
import { processPaths } from 'cli/setup-work/handlers/paths';
import { processRules } from 'cli/setup-work/handlers/rules';
import { processSettings } from 'cli/setup-work/handlers/settings';
import { render } from 'cli/setup-work/common';
import { resetState } from 'cli/setup-work/state';

export async function setupPreset() {
  let option: presetMenu.PossibleOptions;

  do {
    option = await render(presetMenu);

    switch (option) {
      case 'back': {
        resetState();
        return;
      }
      case 'prompt': {
        await processPrompt();
        break;
      }
      case 'knowledgeSrc': {
        await processKnowledgeSrc();
        break;
      }
      case 'workspace': {
        await processWorkspace();
        break;
      }
      case 'paths': {
        await processPaths();
        break;
      }
      case 'rules': {
        await processRules();
        break;
      }
      case 'settings': {
        await processSettings();
        break;
      }
    }
  } while (option !== 'start');
}
