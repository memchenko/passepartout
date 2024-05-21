import { PossibleRootDirectories } from 'helpers/types';

export const getRootDirectoryTypeToPathDict = (): Record<PossibleRootDirectories, string> => ({
  application: process.env.APP_PATH,
  result: process.env.RESULT_PATH,
});
