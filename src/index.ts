import 'dotenv/config';
import prompts from 'prompts';
import path from 'node:path';
import { spawn } from 'node:child_process';

const main = async () => {
  const answer = await prompts({
    type: 'text',
    name: 'directory',
    message: `Specify relative (to ${process.cwd()}) or absolute path to a folder`,
  });

  if (path.isAbsolute(answer.directory)) {
    process.env.APP_PATH = answer.directory;
  } else {
    process.env.APP_PATH = path.resolve(process.cwd(), answer.directory);
  }

  const appScriptPath = path.resolve(__dirname, 'app.js');
  const args = [appScriptPath];

  const app = spawn(process.execPath, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  app.on('close', () => {
    process.exit(0);
  });
};

main();
