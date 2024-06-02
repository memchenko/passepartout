import * as selectPreset from 'cli/setup-work/menus/select-preset';
import { render } from 'cli/setup-work/common';
import { state } from 'cli/setup-work/state';

export async function choosePreset() {
  state.preset = {
    type: await render(selectPreset),
    parameters: null,
  };
}
