import prompts from 'prompts';
import * as settingsMenu from 'cli/setup-work/menus/settings';
import { state } from 'cli/setup-work/state';
import { render } from 'cli/setup-work/common';

export const processSettings = async () => {
  let option: settingsMenu.PossibleOptions;

  do {
    option = await render(settingsMenu);

    switch (option) {
      case 'cycles': {
        const answer = await prompts({
          type: 'number',
          min: 1,
          name: 'cyclesNumber',
          message: 'Specify frequency of control (# of cycles)',
        });

        state.settings.controlFrequency = answer.cyclesNumber;
      }
    }
  } while (option !== 'back');
};
