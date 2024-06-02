import * as writer from 'actors/writer';
import { writeFileAsync } from 'lib/promisified';
import { displaySpinner, displayFailure, displaySuccess } from 'lib/cli';

export const run = async (goal: string, path: string, rules?: string) => {
  const spinner = displaySpinner('Generating content...');

  try {
    const { response } = await writer.run({
      goal,
      rules,
    });

    spinner.text = `Writing the content to the file ${path}`;

    await writeFileAsync(path, response, {
      flag: 'w',
      encoding: 'utf-8',
    });

    displaySuccess.call(spinner, `File ${path} successfully created`);
  } catch {
    displayFailure.call(spinner, `Failed to write ${path} file`);
  }
};
