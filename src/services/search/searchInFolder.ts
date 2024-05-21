import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import { searchInFile } from './searchInFile';

const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

export async function searchInFolder(folderPath: string, regex: string) {
  const files = await readdirAsync(folderPath);
  const results = await Promise.all(
    files.map(async (file: string) => {
      const filePath = path.join(folderPath, file);
      const fileStats = await statAsync(filePath);

      if (fileStats.isFile()) {
        return searchInFile(filePath, regex);
      }

      return [];
    }),
  );

  return results.flat();
}
