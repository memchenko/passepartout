import { state } from 'cli/setup-work/state';
import { assertIsNotNil, assertHasProperty } from 'helpers/type-guards';
import * as universalActor from 'actors/universal';
import { applyVariables } from 'cli/setup-work/common';

export async function runActor() {
  assertIsNotNil(state.actor);

  switch (state.actor.type) {
    case 'universal': {
      await runUniversalActor();
    }
  }
}

async function runUniversalActor() {
  const parameters = state.actor?.parameters;
  assertIsNotNil(parameters);
  assertHasProperty(parameters, 'knowledgeSrc');
  assertHasProperty(parameters, 'workspaceFolder');
  assertIsNotNil(parameters.knowledgeSrc?.value);
  assertIsNotNil(parameters.workspaceFolder);

  for (let i = 0; i < state.numberOfTasks; i++) {
    const goal = applyVariables();

    const initialResultPath = process.env.RESULT_PATH;
    const initialProjectPath = process.env.PROJECT_PATH;
    process.env.PROJECT_PATH = parameters.knowledgeSrc.value;
    process.env.RESULT_PATH = parameters.workspaceFolder;

    await universalActor.run(goal, {
      controlFrequency: state.settings.controlFrequency,
    });

    process.env.PROJECT_PATH = initialProjectPath;
    process.env.RESULT_PATH = initialResultPath;
  }
}
