import { ChatOpenAI } from '@langchain/openai';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  AIMessagePromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { ChatMessageHistory } from 'langchain/stores/message/in_memory';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { createOpenAIToolsAgent, AgentExecutor } from 'langchain/agents';
import { AutoGPT } from 'langchain/experimental/autogpt';
import { BabyAGI } from 'langchain/experimental/babyagi';
import { PlanAndExecuteAgentExecutor } from 'langchain/experimental/plan_and_execute';

import {
  addTask,
  chat,
  completeTask,
  directoryReader,
  editNoteByManager,
  fileReader,
  internalChatForManager,
  leaveNoteFromManager,
  listNotes,
  listTasks,
  readNote,
  readTask,
  removeNote,
  searchInFolder,
  searchInFile,
  updateTask,
} from 'tools/index';

export const tools = [
  addTask,
  chat,
  completeTask,
  directoryReader,
  editNoteByManager,
  fileReader,
  internalChatForManager,
  leaveNoteFromManager,
  listNotes,
  listTasks,
  readNote,
  readTask,
  removeNote,
  searchInFolder,
  searchInFile,
  updateTask,
];

const llm = new ChatOpenAI({
  model: 'gpt-4-turbo',
  temperature: 0.8,
  apiKey: process.env.API_KEY,
});

const template = `
You are a Manager Agent.
Your primary goal is to understand the user's requirements, plan the project accordingly, create tasks for other agents, and track how the project is going.
At this moment, your team includes consists of only a Analyst Agent.

You have access to the following tools:

{tools}

In order to use a tool, you can use <tool></tool> and <tool_input></tool_input> tags. 
You will then get back a response in the form <observation></observation>.
For example, if you have a tool called 'create_task' that could create a new task, in order to create a task named "Design database schema" you would respond:

<tool>create_task</tool><tool_input>Design database schema</tool_input>
<observation>Task 'Design database schema' created successfully</observation>

Instructions:
1. Understand the user's request and break it down into manageable tasks.
2. Plan the project in a logical sequence.
3. Create specific tasks for each part of the project.
4. Utilize available tools to organize and document tasks.
5. Communicate with the user and other agents as needed.

Communication with Analyst Agent:
- Be concise and efficient.
- Clearly state the task or request.
- Provide necessary details without excessive information.
- Example: To request an analysis of the project requirements, you would respond:
  <tool>communicate_with_analyst</tool><tool_input>Analyze project requirements and document findings</tool_input>
  <observation>Request sent to Analyst Agent</observation>

When you think the project is done, ask the user if everything is ok and if it is respond with <final_answer>Project done!</final_answer> otherwise continue work.
In case of chatting with your AI teammates the final answer between <final_answer></final_answer> can be any string.

Begin!

User Request: {input}
`;

const prompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(template),
  new MessagesPlaceholder('chat_history'),
  new MessagesPlaceholder('agent_scratchpad'),
]);

export const buildAgent = async () => {
  const agent = await createOpenAIToolsAgent({
    llm,
    prompt,
    tools,
  });
  const agentExecutor = AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    maxIterations: Infinity,
  });
  const messageHistory = new ChatMessageHistory();
  const agentWithChatHistory = new RunnableWithMessageHistory({
    runnable: agentExecutor,
    // This is needed because in most real world scenarios, a session id is needed per user.
    // It isn't really used here because we are using a simple in memory ChatMessageHistory.
    getMessageHistory: (_sessionId) => messageHistory,
    inputMessagesKey: 'input',
    historyMessagesKey: 'chat_history',
  });

  return agentWithChatHistory;
};
