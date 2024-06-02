import * as userSupervision from 'cli/running-universal/menus/user-supervision';
import * as whatsNext from 'cli/running-universal/menus/whats-next';
import { state } from 'presets/universal/state';
import { runTerminalEditor } from 'lib/terminalEditor';

export const runUser = async () => {
  const answer = await whatsNext.render();

  switch (answer) {
    case 'finish': {
      return;
    }
    case 'insight': {
      return processEditInsight();
    }
    case 'continue': {
      return processContinue();
    }
    default: {
      throw new Error(`Unknown option: ${answer}`);
    }
  }
};

const processContinue = async () => {
  const { decision } = state.results;
  const answer = await userSupervision.render();

  const next = answer === 'confirm' ? (decision as typeof state.startNextCycleFrom) : answer;

  state.startNextCycleFrom = next;
};

const processEditInsight = async () => {
  state.previousSummary = await runTerminalEditor(state.previousSummary);
  state.startNextCycleFrom = 'planner';
};
