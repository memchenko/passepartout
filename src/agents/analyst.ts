import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { SystemMessagePromptTemplate, AIMessagePromptTemplate } from '@langchain/core/prompts';
import { Tool } from '@langchain/core/tools';
import { AgentStep, AgentAction, AgentFinish } from 'langchain/agents';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, Runnable } from '@langchain/core/runnables';

import { renderTextDescription } from 'langchain/tools/render';
import { formatToOpenAIFunctionMessages } from 'langchain/agents/format_scratchpad';

import {
  addTask,
  completeTask,
  mkdir,
  directoryReader,
  editNoteByAnalyst,
  fileReader,
  internalChatForAnalyst,
  leaveNoteFromAnalyst,
  listNotes,
  listTasks,
  readNote,
  readTask,
  removeNote,
  searchInFolder,
  searchInFile,
  updateTask,
  writeMarkdownFile,
  findReferences,
  goToDefinition,
} from 'tools/index';
import { onMessageToAgent } from 'services/notifications/helpers';
import { InternalMessage } from 'helpers/types';
import { formatMessage } from 'helpers/formatting';
import { handleAgentAction } from 'helpers/agents';

const tools = [
  addTask,
  completeTask,
  directoryReader,
  editNoteByAnalyst,
  fileReader,
  internalChatForAnalyst,
  leaveNoteFromAnalyst,
  listNotes,
  listTasks,
  readNote,
  readTask,
  removeNote,
  searchInFolder,
  searchInFile,
  updateTask,
  writeMarkdownFile,
  findReferences,
  goToDefinition,
  mkdir,
];

const llm = new ChatOpenAI({
  model: 'gpt-4-turbo',
  temperature: 0.8,
  apiKey: process.env.API_KEY,
});

const template = `You are an Analyst Agent. Your primary goal is to understand the project requirements, analyze the components and structure of the application, and document everything in a concise and comprehensive manner. The documentation must be in the form of markdown files which will be part of an Obsidian vault, so these markdown files must have interlinks to see everything in the graph view, including mermaid diagrams and pseudo code. These files will reflect entities, logic, scenarios, and algorithms of the application. This documentation will be used to write integration and end-to-end tests.

You have access to the following tools:

{tools}

In order to use a tool, you can use <tool></tool> and <tool_input></tool_input> tags. 
You will then get back a response in the form <observation></observation>.
For example, if you have a tool called 'write-markdown-file' that could create a new markdown file, in order to create a file named "Entity.md" you would respond:

<tool>write-markdown-file</tool><tool_input>Entity</tool_input>
<observation>Markdown file 'Entity.md' created successfully</observation>

Instructions:
1. Understand the project requirements and break down the application into its components.
2. Analyze and document the entities, logic, scenarios, and algorithms.
3. Use mermaid diagrams to visually represent the entities and their relationships.
4. Write pseudo code to describe the logic, scenarios, and algorithms.
5. Store all documentation in markdown files within the Obsidian vault.
6. Utilize available tools to create, manage, and document tasks and notes.

Communication with AI Teammates:
- Be concise and efficient.
- Clearly state the task or request.
- Provide necessary details without excessive information.
- Example: To request a task creation from the Manager Agent, you would respond:
  <tool>internal-chat</tool><tool_input>Create a task for documenting the API endpoints</tool_input>
  <observation>Request sent to Manager Agent</observation>

Example:
To document an entity relationship diagram, you would respond:
<tool>write-markdown-file</tool><tool_input>Entity</tool_input>
<content>
\`\`\`mermaid
classDiagram
    ClassA --> ClassB : Relationship
    ClassA : Attribute1
    ClassA : Method1()
\`\`\`
</content>
<observation>Markdown file 'Entity.md' created with entity relationship diagram</observation>

When you have completed your analysis, respond with your answer between <final_answer></final_answer>.

Begin!

Task: {input}`;
const prompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(template),
  AIMessagePromptTemplate.fromTemplate('{agent_scratchpad}'),
]);

const outputParser = new StringOutputParser();

const runnableAgent = RunnableSequence.from([
  {
    input: (i: { input: string; tools: Tool[]; steps: AgentStep[] }) => i.input,
    tools: (i: { input: string; tools: Tool[]; steps: AgentStep[] }) => renderTextDescription(tools),
    agent_scratchpad: (i: { input: string; tools: Tool[]; steps: AgentStep[] }) =>
      formatToOpenAIFunctionMessages(i.steps),
  },
  prompt,
  llm,
  outputParser,
]) as any;

const messagesToAnalystQueue = new Subject<InternalMessage>();
const enqueueMessageToAnalyst = (message: InternalMessage) => {
  messagesToAnalystQueue.next(message);
};

export const buildAgent = async () => {
  // const agent = await createOpenAIFunctionsAgent({
  //   llm,
  //   prompt,
  //   tools,
  // });
  const agentExecutor = AgentExecutor.fromAgentAndTools({
    agent: runnableAgent,
    tools,
  });

  onMessageToAgent('analyst', enqueueMessageToAnalyst);
  messagesToAnalystQueue.pipe(concatMap(processMessage.bind(null, agentExecutor))).subscribe();

  return [agentExecutor, tools] as const;
};

const processMessage = (agent: AgentExecutor, message: InternalMessage) => {
  return new Promise((resolve) => {
    agent.invoke(
      {
        input: formatMessage(message),
        tools,
      },
      {
        configurable: {
          sessionId: message.signer,
        },
        callbacks: [
          {
            handleAgentAction: handleAgentAction.bind(null, 'analyst'),
            handleAgentEnd: resolve,
            handleChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name) {
              process.stdout.write('ANALYST AWOKE');
            },
          },
        ],
      },
    );
  });
};
