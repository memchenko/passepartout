import * as editor from 'actors/editor';
import { readFileAsync, writeFileAsync } from 'lib/promisified';
import { displaySpinner, displayFailure, displaySuccess } from 'lib/cli';

export const run = async (updates: string, path: string, rules?: string) => {
  const spinner = displaySpinner(`Reading file ${path}...`);

  try {
    const fileContent = await readFileAsync(path, {
      encoding: 'utf-8',
    });

    spinner.text = 'Generating updates...';

    const { response } = await editor.run({
      updates,
      content: fileContent,
      rules,
    });

    spinner.text = `Writing updates to the file ${path}`;

    await writeFileAsync(path, response, {
      flag: 'w',
      encoding: 'utf-8',
    });

    displaySuccess.call(spinner, `File ${path} successfully updated`);
  } catch {
    displayFailure.call(spinner, `Failed to update ${path}`);
  }
};
