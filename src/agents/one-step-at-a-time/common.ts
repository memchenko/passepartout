import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import { writeLog } from 'helpers/log';
import { marked } from 'marked';
import ora from 'ora';
import { assertIsNotNil, isError, isNotNil } from 'helpers/type-guards';

export const state = {
  globalGoal: '',
  previousSummary: '',
  errors: [] as string[],
  cycles: 0,
  results: {
    planning: '',
    execution: '',
    decision: '',
    mining: '',
    summarizing: '',
  },
};

export enum ErrorCodes {
  ResponseNil = 'Response is nil',
  ToolFailed = "Tool wasn't selected",
}

export const getCreativeLLM = () =>
  new ChatOpenAI({
    modelName: 'gpt-4o',
    apiKey: process.env.API_KEY,
    temperature: 0.8,
  });

export const getExecutiveLLM = () =>
  new ChatOpenAI({
    modelName: 'gpt-4o',
    apiKey: process.env.API_KEY,
    temperature: 0.2,
  });

export const displayTitle = (title: string) => {
  console.log(chalk.black.bold.bgWhite(title.toUpperCase()));
};

export const displayGlobalGoal = () => {
  displayTitle('The task');
  console.log(state.globalGoal);
};

export const displayPreviousSummary = async () => {
  displayTitle('Insights');
  console.log(await marked.parse(state.previousSummary));
};

export const displaySpinner = (text: string) => {
  writeLog('[STARTING]', text);
  return ora({
    text: chalk.italic(text),
    spinner: 'point',
    color: 'cyan',
  }).start();
};

export function displaySuccess(this: ora.Ora, text: string) {
  this.succeed(chalk.reset.green(text));
  writeLog('[SUCCESS]', text, 'success');
}

export function displayFailure(this: ora.Ora, text: string) {
  this.fail(chalk.reset.red(text));
  writeLog('[FAILED]', text, 'error');
}

export const buildRunner = <Fn extends (...args: any[]) => Promise<string>>(
  runFn: Fn,
  texts: {
    runnerName: string;
    start: string;
    success: string;
    failure: string;
  },
) => {
  return async (...args: Parameters<Fn>) => {
    const spinner = displaySpinner(texts.start);

    try {
      const response = await runFn(...args);

      assertIsNotNil(response, ErrorCodes.ResponseNil);

      displaySuccess.call(spinner, texts.success);
      writeLog(texts.success, response, 'success');

      return response;
    } catch (err) {
      let text = String(err);
      if (isError(err) && isNotNil(err.stack)) {
        text = err.stack;
      }

      displayFailure.call(spinner, texts.failure);
      writeLog(texts.failure, text, 'error');

      throw err;
    }
  };
};
