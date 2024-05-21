import { promisify } from 'node:util';

import { InternalMessage } from 'helpers/types';

import { Events, notifier } from './index';

type MessageCallback = (err: Error | undefined, message: InternalMessage) => void;

export const waitForInternalMessage = promisify(
  (params: { topic: string; recipient?: InternalMessage['recipient'] }, cb: MessageCallback): void => {
    const listener = (message: InternalMessage) => {
      if (params.recipient !== undefined && message.recipient !== params.recipient) {
        return;
      }

      if (message.topic === params.topic) {
        notifier.off(Events.InternalMessage, listener);
        cb(undefined, message);
      }
    };

    notifier.on(Events.InternalMessage, listener);
  },
);

export const onMessageToAgent = (agent: InternalMessage['recipient'], cb: (message: InternalMessage) => void) => {
  const listener = (message: InternalMessage) => {
    if (message.recipient === agent || message.recipient === 'all') {
      cb(message);
    }
  };

  notifier.on(Events.InternalMessage, listener);

  return () => notifier.off(Events.InternalMessage, listener);
};
