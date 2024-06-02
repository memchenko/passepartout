import prompts from 'prompts';
import { state } from 'cli/setup-work/state';
import { formatTextAsConfirmed, extractVariables } from 'cli/setup-work/common';
import { assertIsNotNil } from 'lib/type-guards';

export type PossibleOptions = 'write' | 'variables' | 'back';

export const render = async (): Promise<PossibleOptions> => {
  const choices: prompts.Choice[] = [
    {
      title: formatTextAsConfirmed('Write', state.prompt?.value),
      value: 'write',
    },
    {
      title: 'Go back',
      value: 'back',
    },
  ];
  const hasVariables = extractVariables(state.prompt?.value ?? '').length > 0;

  if (hasVariables) {
    choices.splice(1, 0, {
      title: formatTextAsConfirmed('Specify variables *', state.prompt?.variables),
      value: 'variables',
    });
  }

  const answer = await prompts({
    type: 'select',
    name: 'option',
    message: 'Choose option',
    choices,
  });

  return answer.option;
};

export const buildVariablesJson = () => {
  const variables = extractVariables(state.prompt?.value ?? '');

  assertIsNotNil(variables, "Prompt doesn't contain variables.");

  return variables.reduce(
    (acc, variable) => ({
      ...acc,
      [variable]: [],
    }),
    {},
  );
};
