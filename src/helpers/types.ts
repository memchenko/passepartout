import * as z from 'zod';

export const possibleAgentsSchema = z.enum(['manager', 'analyst']);

export const possibleRootDirectories = z.enum(['result', 'application']);

export type PossibleAgents = z.infer<typeof possibleAgentsSchema>;

export type PossibleRootDirectories = z.infer<typeof possibleRootDirectories>;

export const internalMessageSchema = z.object({
  recipient: possibleAgentsSchema.or(z.literal('all')),
  topic: z.string().optional(),
  message: z.string(),
  signer: possibleAgentsSchema,
});

export type InternalMessage = z.infer<typeof internalMessageSchema>;
