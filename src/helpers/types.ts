import * as z from 'zod';

export const possibleAgentsSchema = z.enum(['manager', 'analyst']);

export const possibleSpaces = z.enum(['result', 'application']);

export type PossibleAgents = z.infer<typeof possibleAgentsSchema>;

export type PossibleSpaces = z.infer<typeof possibleSpaces>;

export const internalMessageSchema = z.object({
  recipient: possibleAgentsSchema.or(z.literal('all')),
  topic: z.string().optional(),
  message: z.string(),
  signer: possibleAgentsSchema,
});

export type InternalMessage = z.infer<typeof internalMessageSchema>;
