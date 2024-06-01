import * as selectActor from 'cli/setup-work/menus/select-actor';
import { render } from 'cli/setup-work/common';
import { state } from 'cli/setup-work/state';

export async function chooseActor() {
  state.actor = {
    type: await render(selectActor),
    parameters: null,
  };
}
