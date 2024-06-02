import { PossibleSpaces } from 'lib/types';

export const getSpaceTypeToPathDict = (): Record<PossibleSpaces, string> => ({
  knowledge: process.env.PROJECT_PATH,
  workspace: process.env.RESULT_PATH,
});
