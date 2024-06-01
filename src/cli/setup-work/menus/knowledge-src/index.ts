import prompts from 'prompts';
import { formatTextAsConfirmed } from 'cli/setup-work/common';
import { state } from 'cli/setup-work/state';
import { assertIsDefined } from 'helpers/type-guards';
import { UniversalActor } from 'cli/setup-work/types';

export type PossibleOptions = 'directory' | 'file' | 'web' | 'user' | 'ai' | 'back';

export const render = async (): Promise<PossibleOptions> => {
  const parameters = state.actor?.parameters as UniversalActor['parameters'];
  assertIsDefined(parameters);

  const answer = await prompts({
    type: 'select',
    name: 'option',
    message: formatTextAsConfirmed('Select knowledge source *', parameters?.knowledgeSrc),
    choices: [
      {
        title: formatTextAsConfirmed('File', parameters?.knowledgeSrc, () => parameters?.knowledgeSrc?.type === 'file'),
        value: 'file',
      },
      {
        title: formatTextAsConfirmed(
          'Folder',
          parameters?.knowledgeSrc,
          () => parameters?.knowledgeSrc?.type === 'directory',
        ),
        value: 'directory',
      },
      {
        title: formatTextAsConfirmed(
          'Web page',
          parameters?.knowledgeSrc,
          () => parameters?.knowledgeSrc?.type === 'web',
        ),
        value: 'web',
      },
      {
        title: formatTextAsConfirmed('User', parameters?.knowledgeSrc, () => parameters?.knowledgeSrc?.type === 'user'),
        value: 'user',
      },
      // {
      //   title: formatTextAsConfirmed('Another AI assistant', knowledgeSrc, () => knowledgeSrc?.type === 'actor'),
      //   value: 'ai',
      // },
      {
        title: 'Go back',
        value: 'back',
      },
    ],
  });

  return answer.option;
};
