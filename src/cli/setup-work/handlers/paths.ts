import path from 'node:path';
import { state } from 'cli/setup-work/state';
import { assertIsNotNil } from 'lib/type-guards';
import * as pathsMenu from 'cli/setup-work/menus/paths';
import { render } from 'cli/setup-work/common';

export const processPaths = async (): Promise<void> => {
  assertIsNotNil(state.preset);

  const paths = (await render(pathsMenu)).map((value) => {
    if (path.isAbsolute(value)) {
      return value;
    } else {
      return path.join(process.cwd(), value);
    }
  });

  state.preset.parameters = { paths };
  state.numberOfTasks = paths.length;
};
