import { PromptObject } from 'prompts';
import mergeWith from 'lodash/mergeWith';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { Object } from 'ts-toolbelt';
import { state } from 'cli/setup-work/state';
import { formatTextAsConfirmed } from 'cli/setup-work/common';

const buildCommonConfig = (): PromptObject<'option'> => ({
  type: 'select',
  name: 'option',
  message: 'Select option',
  choices: [
    {
      title: formatTextAsConfirmed('Set prompt *', state.prompt),
      value: 'prompt',
    },
    {
      title: formatTextAsConfirmed('Set rules', state.rules, () => !isEmpty(state.rules)),
      value: 'rules',
    },
    {
      title: 'Edit settings',
      value: 'settings',
    },
    {
      title: 'Go back',
      value: 'back',
    },
    {
      title: 'Start',
      value: 'start',
    },
  ],
});

export const buildConfig = (
  partialConfig: Object.Partial<PromptObject, 'deep'>,
): ReturnType<typeof buildCommonConfig> => {
  const result = mergeWith(buildCommonConfig(), partialConfig, (objValue: unknown, srcValue: unknown) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      const result = cloneDeep(objValue);
      result.splice(2, 0, ...srcValue);
      return result;
    }

    return merge(objValue, srcValue);
  });

  return result;
};
