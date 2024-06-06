import prompts from 'prompts';
import isEmpty from 'lodash/isEmpty';
import { formatTextAsConfirmed } from 'cli/setup-work/common';
import { state } from 'cli/setup-work/state';
import { assertIsNotNil } from 'lib/type-guards';
import { presetTypeToActorsList } from 'lib/dicts';

export type PossibleOptions = 'write' | 'select' | 'load' | 'back';

export const render = async (): Promise<[Exclude<Actors, 'user'> | null, PossibleOptions]> => {
  assertIsNotNil(state.preset);

  const actorsList = presetTypeToActorsList[state.preset.type] ?? [];
  const option = (
    await prompts({
      type: 'select',
      name: 'option',
      message: formatTextAsConfirmed('Select how to specify rules', state.rules, () => !isEmpty(state.rules)),
      choices: [
        {
          title: 'Write',
          value: 'write',
        },
        // {
        //   title: 'Select existing',
        //   value: 'select',
        // },
        {
          title: 'Load from file',
          value: 'load',
        },
        {
          title: 'Go back',
          value: 'back',
        },
      ],
    })
  ).option;
  let actor: Exclude<Actors, 'user'> | null = null;

  if (actorsList.length > 0) {
    actor = (
      await prompts({
        type: 'select',
        name: 'actor',
        message: 'Select actor to specify rules for',
        choices: actorsList?.map((actor) => ({
          title: actor.toUpperCase(),
          value: actor,
        })),
      })
    ).actor;
  }

  return [actor, option];
};
