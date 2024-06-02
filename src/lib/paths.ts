import path from 'node:path';
import { PossibleSpaces } from 'lib/types';
import { getSpaceTypeToPathDict } from 'lib/dicts';

export const getPaths = (space: PossibleSpaces, pathSegments: string[]) => {
  const rootPath = getSpaceTypeToPathDict()[space];
  let relativePath = path.normalize(pathSegments.join('/'));
  relativePath = relativePath.startsWith('./') ? relativePath : `./${relativePath}`;

  return {
    fullPath: path.join(rootPath, relativePath),
    relativePath,
  };
};
