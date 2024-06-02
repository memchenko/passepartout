import chalk from 'chalk';
import ora from 'ora';

export const displaySpinner = (text: string) => {
  return ora({
    text: chalk.italic(text),
    spinner: 'point',
    color: 'cyan',
  }).start();
};

export function displaySuccess(this: ora.Ora, text: string) {
  this.succeed(chalk.reset.green(text));
}

export function displayFailure(this: ora.Ora, text: string) {
  this.fail(chalk.reset.red(text));
}

export const displayTitle = (title: string) => {
  console.log(chalk.black.bold.bgWhite(title.toUpperCase()));
};

export const displaySection = (title: string, text: string) => {
  displayTitle(title);
  console.log(text);
};
