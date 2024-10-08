import path from 'node:path';
import { state } from 'cli/setup-work/state';
import { assertIsNotNil, assertHasProperty } from 'lib/type-guards';
import * as universalPreset from 'cli/running-universal';
import { applyVariables } from 'cli/setup-work/common';
import * as editorPreset from 'presets/editor';
import * as writerPreset from 'presets/writer';
import { resetConfig, config as universalPresetConfig } from 'presets/universal/config';
import { resetState, state as universalPresetState } from 'presets/universal/state';
import { displaySection } from 'lib/cli';
import { writeLog } from 'lib/log';

export async function runPreset() {
  assertIsNotNil(state.preset);

  switch (state.preset.type) {
    case 'universal': {
      await runUniversalPreset();
    }
    case 'editor': {
      await runEditorPreset();
    }
    case 'writer': {
      await runWriterPreset();
    }
  }
}

async function runUniversalPreset() {
  const parameters = state.preset?.parameters;
  assertIsNotNil(parameters);
  assertHasProperty(parameters, 'knowledgeSrc');
  assertHasProperty(parameters, 'workspaceFolder');
  assertIsNotNil(parameters.knowledgeSrc?.value);
  assertIsNotNil(parameters.workspaceFolder);

  const initialResultPath = process.env.RESULT_PATH;
  const initialProjectPath = process.env.PROJECT_PATH;

  for (let i = 0; i < state.numberOfTasks; i++) {
    resetState();
    resetConfig();

    const goal = applyVariables();

    process.env.PROJECT_PATH = path.resolve(process.cwd(), parameters.knowledgeSrc.value);
    process.env.RESULT_PATH = path.resolve(process.cwd(), parameters.workspaceFolder);

    writeLog(
      'Universal iteration',
      JSON.stringify(
        {
          state,
          universalPresetState,
          universalPresetConfig,
          projectPath: process.env.PROJECT_PATH,
          resultPath: process.env.RESULT_PATH,
        },
        null,
        2,
      ),
      'default',
    );

    await universalPreset.run(goal, {
      controlFrequency: state.settings.controlFrequency,
      rules: state.rules,
    });
  }
  process.env.PROJECT_PATH = initialProjectPath;
  process.env.RESULT_PATH = initialResultPath;
}

async function runEditorPreset() {
  const parameters = state.preset?.parameters;
  assertIsNotNil(parameters);
  assertHasProperty(parameters, 'paths');
  assertIsNotNil(parameters.paths);
  assertIsNotNil(state.prompt?.value);
  assertIsNotNil(state.rules.executor);

  console.clear();
  displaySection('The goal', state.prompt.value);

  for (let i = 0; i < parameters.paths.length; i++) {
    const goal = state.prompt.value;
    const path = parameters.paths[i];
    const rules = state.rules.executor;

    await editorPreset.run(goal, path, rules);
  }
}

async function runWriterPreset() {
  const parameters = state.preset?.parameters;
  assertIsNotNil(parameters);
  assertHasProperty(parameters, 'paths');
  assertIsNotNil(parameters.paths);
  assertIsNotNil(state.prompt?.value);
  assertIsNotNil(state.rules.executor);

  console.clear();
  displaySection('The goal', state.prompt.value);

  for (let i = 0; i < parameters.paths.length; i++) {
    const goal = state.prompt.value;
    const path = parameters.paths[i];
    const rules = state.rules.executor;

    await writerPreset.run(goal, path, rules);
  }
}
