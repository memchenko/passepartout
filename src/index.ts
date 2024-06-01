import 'dotenv/config';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import * as setupWork from 'cli/setup-work';

const main = async () => {
  marked.use(markedTerminal() as any);

  await setupWork.start();
};

main();
