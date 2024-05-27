import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import { writeLog } from 'helpers/log';
import { marked } from 'marked';
import ora from 'ora';
import { assertIsNotNil, isError, isNotNil } from 'helpers/type-guards';
import { DISPLAYED_SUMMARY_LENGTH } from './constants';

export const state = {
  globalGoal: '',
  previousSummary: '',
  errors: [] as string[],
  cycles: 0,
  startNextCycleFrom: 'planner',
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
  ToolFailed = 'Action execution failed. Try again',
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
  const length = state.previousSummary.length;
  let summaryDisplayed = state.previousSummary || 'No summary yet.';

  if (length > DISPLAYED_SUMMARY_LENGTH) {
    summaryDisplayed = state.previousSummary.slice(0, DISPLAYED_SUMMARY_LENGTH);
    summaryDisplayed += `\n... (${length - DISPLAYED_SUMMARY_LENGTH} more) ...`;
  }

  displayTitle('Insights');
  console.log(await marked.parse(summaryDisplayed));
};

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

export const buildRunner = <Fn extends (...args: any[]) => Promise<string>>(
  runFn: Fn,
  textsConfig: {
    runnerName: string;
    start: string;
    success: string;
    failure: string;
    includeResponseInSuccess?: boolean;
  },
) => {
  return async (...args: Parameters<Fn>) => {
    const spinner = displaySpinner(textsConfig.start);

    try {
      writeLog(`${textsConfig.runnerName}'s arguments`, JSON.stringify(args, null, 2));
      const response = await runFn(...args);

      assertIsNotNil(response, ErrorCodes.ResponseNil);

      displaySuccess.call(
        spinner,
        textsConfig.includeResponseInSuccess ? `${textsConfig.success}: ${response}` : textsConfig.success,
      );
      writeLog(textsConfig.success, response, 'success');

      return response;
    } catch (err) {
      let text = String(err);
      if (isError(err) && isNotNil(err.stack)) {
        text = err.stack;
      }

      displayFailure.call(spinner, textsConfig.failure);
      writeLog(textsConfig.failure, text, 'error');
      console.log(text);

      throw err;
    }
  };
};
