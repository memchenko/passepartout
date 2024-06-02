import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import cp from 'node:child_process';

export const runTerminalEditor = (initialContent: string = '') => {
  const editor = process.env.EDITOR || 'vi';
  const fileName = path.join(os.tmpdir(), 'input.txt');

  return new Promise<string>((resolve) => {
    if (initialContent) {
      fs.writeFileSync(fileName, initialContent, {
        encoding: 'utf8',
      });
    }

    function finalize() {
      const input = fs.readFileSync(fileName);
      fs.unlinkSync(fileName);
      resolve(input.toString());
    }

    const child = cp.spawn(editor, [fileName], {
      stdio: 'inherit',
    });

    child.on('exit', () => {
      finalize();
    });
  });
};
