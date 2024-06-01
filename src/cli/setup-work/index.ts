import { chooseActor } from './workflow/chooseActor';
import { setupActor } from './workflow/setupActor';
import { runActor } from './workflow/runActor';
import { state } from './state';

export const start = async () => {
  while (true) {
    await chooseActor();
    await setupActor();

    if (state.actor !== null) {
      await runActor();
    }
  }
};
