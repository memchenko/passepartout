import { marked } from 'marked';
import { writeLog } from 'lib/log';
import { displayFailure, displaySpinner, displaySuccess, displayTitle, displaySection } from 'lib/cli';
import { assertIsNotNil, isError, isNotNil } from 'lib/type-guards';
import { DISPLAYED_SUMMARY_LENGTH } from './constants';

export const displaySummary = async (text: string) => {
  const length = text.length;
  let summaryDisplayed = text || 'No summary yet.';

  if (length > DISPLAYED_SUMMARY_LENGTH) {
    summaryDisplayed = text.slice(0, DISPLAYED_SUMMARY_LENGTH);
    summaryDisplayed += `\n... (${length - DISPLAYED_SUMMARY_LENGTH} more) ...`;
  }

  displaySection('Insights', await marked.parse(summaryDisplayed));
};

export const wrapActorRunner = <Fn extends (...args: any[]) => Promise<ActorResponse>>(
  runActor: Fn,
  config: {
    runnerName: string;
    startText: string;
    successText: string;
    failureText: string;
  },
) => {
  return async (...args: Parameters<Fn>) => {
    const spinner = displaySpinner(config.startText);

    try {
      writeLog(`${config.runnerName}'s arguments`, JSON.stringify(args, null, 2));
      const { response, successMessage } = await runActor(...args);

      assertIsNotNil(response, 'Response is nil');

      displaySuccess.call(spinner, successMessage ? `${config.successText}: ${successMessage}` : config.successText);
      writeLog(config.successText, response, 'success');

      return response;
    } catch (err) {
      let text = String(err);
      if (isError(err) && isNotNil(err.stack)) {
        text = err.stack;
      }

      displayFailure.call(spinner, config.failureText);
      writeLog(config.failureText, text, 'error');
      console.log(text);

      throw err;
    }
  };
};
