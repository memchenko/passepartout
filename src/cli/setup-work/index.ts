import { choosePreset } from './workflow/choosePreset';
import { setupPreset } from './workflow/setupPreset';
import { runPreset } from './workflow/runPreset';
import { state } from './state';

export const start = async () => {
  while (true) {
    await choosePreset();
    await setupPreset();

    if (state.preset !== null) {
      await runPreset();
    }
  }
};
