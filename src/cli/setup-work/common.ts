import chalk from 'chalk';
import forEach from 'lodash/forEach';
import { state } from './state';
import { assertIsNotNil } from 'helpers/type-guards';

const variablesRegex = /\{[a-zA-Z0-9_]+\}/g;

export const formatTextAsConfirmed = (title: string, value: unknown, shouldFormat?: () => boolean) => {
  if (shouldFormat !== undefined && !shouldFormat()) {
    return title;
  }

  return value ? `${chalk.green(title)} ✅` : title;
};

export const extractVariables = (text: string) => {
  return text.match(variablesRegex) ?? [];
};

export const applyVariables = () => {
  assertIsNotNil(state.prompt?.variables, 'No variables for prompt specified.');

  let prompt = state.prompt.value;

  forEach(state.prompt.variables, (values: string[], key: string) => {
    const value = values.shift();
    assertIsNotNil(value, `No value for variable "${key}"`);

    prompt = prompt.replace(`{${key}}`, value);
  });

  return prompt;
};

export const render = async <T>(menu: { render: () => Promise<T> }) => {
  console.clear();
  return await menu.render();
};
