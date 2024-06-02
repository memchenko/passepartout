import { possibleSpaces } from './schemas';

export const spaces = Object.keys(possibleSpaces.Values);
export const spacesEnumeration = `${spaces.slice(0, -1).join(', ')} and ${spaces.at(-1)}`;
