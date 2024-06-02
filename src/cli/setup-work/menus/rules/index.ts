import prompts from 'prompts';
import { formatTextAsConfirmed } from 'cli/setup-work/common';
import { state } from 'cli/setup-work/state';
import { assertIsNotNil } from 'lib/type-guards';
import { presetTypeToActorsList } from 'lib/dicts';

export type PossibleOptions = 'write' | 'select' | 'load' | 'back';

export const render = async (): Promise<[Exclude<Actors, 'user'>, PossibleOptions]> => {
  assertIsNotNil(state.preset);

  const actorsList = presetTypeToActorsList[state.preset.type] ?? [];
  const questions: prompts.PromptObject[] = [
    {
      type: 'select',
      name: 'option',
      message: formatTextAsConfirmed('Select how to specify rules', state.rules),
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
    },
  ];

  if (actorsList.length > 0) {
    questions.push({
      type: 'select',
      name: 'actor',
      message: 'Select actor to specify rules for',
      choices: actorsList?.map((actor) => ({
        title: actor.toUpperCase(),
        value: actor,
      })),
    });
  }

  const answer = await prompts(questions);

  return [answer.actor, answer.option];
};
