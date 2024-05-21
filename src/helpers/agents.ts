import { AgentAction } from 'langchain/agents';
import { PossibleAgents } from 'helpers/types';

const agentTypeToSignature: Record<PossibleAgents, string> = {
  manager: 'MANAGER ACTION',
  analyst: 'ANALYST ACTION',
};

export const handleAgentAction = (agent: PossibleAgents, { tool, toolInput }: AgentAction) => {
  const toolArgs = JSON.stringify(toolInput, null, 2);

  process.stdout.write('\n----------------------------');
  process.stdout.write(`\n${agentTypeToSignature[agent]}\nusing tool: ${tool};\nwith input: ${toolArgs}`);
};
