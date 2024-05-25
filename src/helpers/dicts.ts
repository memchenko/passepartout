import { PossibleSpaces } from 'helpers/types';

export const getSpaceTypeToPathDict = (): Record<PossibleSpaces, string> => ({
  application: process.env.APP_PATH,
  result: process.env.RESULT_PATH,
});
