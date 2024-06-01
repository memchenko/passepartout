import path from 'node:path';
import { state } from 'cli/setup-work/state';
import { assertIsNotNil } from 'helpers/type-guards';
import * as pathsMenu from 'cli/setup-work/menus/paths';
import { render } from 'cli/setup-work/common';

export const processPaths = async (): Promise<void> => {
  assertIsNotNil(state.actor);

  const paths = (await render(pathsMenu)).map((value) => {
    if (path.isAbsolute(value)) {
      return value;
    } else {
      return path.join(process.cwd(), value);
    }
  });

  state.actor.parameters = { paths };
  state.numberOfTasks = paths.length;
};
