import { DynamicStructuredTool } from '@langchain/core/tools';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { notifier, Events } from 'services/notifications';
import { waitForInternalMessage } from 'services/notifications/helpers';
import { internalMessageSchema, InternalMessage } from 'helpers/types';

const buildInternalChatTool = (signer: InternalMessage['signer']) =>
  new DynamicStructuredTool({
    name: 'internal-chat',
    description:
      'This tool provides a way to communicate with your AI collegues. If you need to wait for response then specify "topic" parameter.',
    schema: internalMessageSchema.omit({ signer: true }),
    func: async ({ recipient, message, topic }) => {
      try {
        notifier.emit(Events.InternalMessage, {
          recipient,
          topic,
          message,
          signer,
        });

        if (topic !== undefined) {
          const response = await waitForInternalMessage({ topic, recipient: signer });

          return response.message;
        }

        return 'Message has been sent successfully.';
      } catch (err: unknown) {
        if (isError(err)) {
          return String(err);
        }

        return UNEXPECTED_ERROR_TOOL_TEXT;
      }
    },
  });

export const internalChatForManager = buildInternalChatTool('manager');
export const internalChatForAnalyst = buildInternalChatTool('analyst');
