import fs from 'node:fs';
import path from 'node:path';
import { DateTime } from 'luxon';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';

const queue = new Subject<string>();

const date = DateTime.now();
const logsViewerPath = path.join(process.env.LOG_PATH, `index.html`);
const logFileName = `${date.toMillis()}.html`;
const logFilePath = path.join(process.env.LOG_PATH, logFileName);

fs.writeFileSync(logsViewerPath, `<a href="./${logFileName}">${date.toISO()}</a>`, {
  flag: 'a',
});

const logStream = fs.createWriteStream(logFilePath, {
  flags: 'w',
});

const sub = queue
  .pipe(
    concatMap((chunk) => {
      return new Promise<void>((resolve, reject) => {
        logStream.write(chunk, (err) => {
          if (!err) {
            resolve();
          }
          reject();
        });
      });
    }),
  )
  .subscribe();

export const writeLog = (
  summary: string,
  text: string,
  level: 'default' | 'success' | 'error' | 'warn' = 'default',
) => {
  const color: Record<typeof level, string>[typeof level] = {
    default: 'black',
    success: 'green',
    error: 'red',
    warn: 'orange',
  }[level];
  const html = `<details><summary style="color:${color}">${summary}</summary><pre>${text}</pre></details>`;

  queue.next(html);
};

export const closeLogStream = async () => {
  sub.unsubscribe();
  await new Promise<void>((resolve, reject) => {
    logStream.close((err) => {
      if (!err) {
        resolve();
      }
      reject();
    });
  });
};

queue.next(`<style>
pre {
  white-space: pre-wrap;
}
</style>`);
queue.next(`<h2>Date: ${DateTime.now().toISO()}</h2>`);
