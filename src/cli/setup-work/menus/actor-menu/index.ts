import prompts from 'prompts';
import { Object } from 'ts-toolbelt';
import { state } from 'cli/setup-work/state';
import { assertActor } from 'cli/setup-work/guards';
import { formatTextAsConfirmed } from 'cli/setup-work/common';
import { EditorActor, ResearcherActor, UniversalActor, WriterActor } from 'cli/setup-work/types';
import { buildConfig } from './common';

export type PossibleOptions =
  | 'prompt'
  | 'rules'
  | 'settings'
  | 'start'
  | 'paths'
  | 'knowledgeSrc'
  | 'workspace'
  | 'back';

export const render = async (): Promise<PossibleOptions> => {
  const { actor } = state;
  assertActor(actor);

  const config = promptsConfigs[actor.type];
  const answer = await prompts(buildConfig(config()));

  return answer.option;
};

const promptsConfigs: Record<ActorType, () => Object.Partial<prompts.PromptObject, 'deep'>> = {
  writer: () => {
    const { actor } = state;
    assertActor<WriterActor>(actor, 'writer');

    return {
      choices: [
        {
          title: formatTextAsConfirmed('Specify path to write to *', actor.parameters?.paths),
          value: 'paths',
        },
      ],
    };
  },
  editor: () => {
    const { actor } = state;
    assertActor<EditorActor>(actor, 'editor');

    return {
      choices: [
        {
          title: formatTextAsConfirmed('Specify path of file to edit *', actor.parameters?.paths),
          value: 'paths',
        },
      ],
    };
  },
  researcher: () => {
    const { actor } = state;
    assertActor<ResearcherActor>(actor, 'researcher');

    return {
      choices: [
        {
          title: formatTextAsConfirmed('Specify knowledge source *', actor.parameters?.knowledgeSrc),
          value: 'knowledgeSrc',
        },
      ],
    };
  },
  universal: () => {
    const { actor } = state;
    assertActor<UniversalActor>(actor, 'universal');

    return {
      choices: [
        {
          title: formatTextAsConfirmed('Specify knowledge source *', actor.parameters?.knowledgeSrc),
          value: 'knowledgeSrc',
        },
        {
          title: formatTextAsConfirmed('Specify workspace folder *', actor.parameters?.workspaceFolder),
          value: 'workspace',
        },
      ],
    };
  },
};
