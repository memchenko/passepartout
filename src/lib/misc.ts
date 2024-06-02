import { possibleSpaces } from './schemas';

export const spaces = Object.keys(possibleSpaces.Values);
export const spacesEnumeration = `${spaces.slice(0, -1).join(', ')} and ${spaces.at(-1)}`;

export const buildRulesString = (rules: string) =>
  rules.length > 0 ? `## Additional rules to consider\n${rules}\n\n` : '';
