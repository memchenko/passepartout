import 'dotenv/config';
import prompts from 'prompts';
import path from 'node:path';

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
  const { start } = await import('./app.js');
  await start();
};

main();
