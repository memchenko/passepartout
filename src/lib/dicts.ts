import { PossibleSpaces } from 'lib/types';

export const getSpaceTypeToPathDict = (): Record<PossibleSpaces, string> => ({
  knowledge: process.env.PROJECT_PATH,
  workspace: process.env.RESULT_PATH,
});

export const presetTypeToActorsList: Partial<Record<PresetType, Actors[]>> = {
  universal: ['planner', 'executor', 'supervisor', 'miner', 'summarizer'],
  writer: ['executor'],
  editor: ['executor'],
};
