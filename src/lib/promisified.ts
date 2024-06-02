import fs from 'node:fs';
import { promisify } from 'node:util';

export const writeFileAsync = promisify(fs.writeFile);
export const readFileAsync = promisify(fs.readFile);
