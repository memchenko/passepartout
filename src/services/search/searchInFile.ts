import fs from 'node:fs';
import readline from 'node:readline';

type Match = { filePath: string; line: number };

export function searchInFile(filePath: string, pattern: string) {
  return new Promise<Match[]>((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath, 'utf8');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let lineNumber = 0;
    const matches: Match[] = [];
    const regex = new RegExp(pattern);

    rl.on('line', (line: string) => {
      lineNumber++;
      if (regex.test(line)) {
        matches.push({ filePath, line: lineNumber });
      }
    });

    rl.on('close', () => resolve(matches));
    rl.on('error', reject);
  });
}
