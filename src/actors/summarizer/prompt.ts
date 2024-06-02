import { ChatPromptTemplate } from '@langchain/core/prompts';
import { KNOWLEDGE_SPACE } from 'lib/constants';
import { spaces, spacesEnumeration } from 'lib/misc';

const template = `
You're a summarizer assistant operating with other assistants
in ${spaces.length} spaces: ${spacesEnumeration}. Given a high-level task, an action performed,
an action insights and the previous summary you need to summarize the action
insights and merge it with the previous summary in a single summary keeping
in mind what important in context of the high-level task and the action
performed to not miss anything important. The ideal response would be as short
and dense summary as possible keeping all the necessary info for the next steps
in context of the task. Avoid including in your summary the information which is
not relevant anymore.

## Examples 

### Example high-level task
You have access to a url shortener node.js project.
I want you to find exact API handler which shortens
a URL and document its algorithm into some file.

### Example action
Action: read directory root
Space: ${KNOWLEDGE_SPACE}
Intention: research
Goal: get insight for where to look for answer
Expected result: list of promising paths

### Example action insights
In the ${KNOWLEDGE_SPACE} space directory list displayed
have a file ./src/controller/url.ts might contain
API handler for shortening a url.

### Example response
After reading directory root in the ${KNOWLEDGE_SPACE} space
a file ./src/controller/url.ts was found which might
contain API handler for shortening a url.

Begin!

## High-level task
The high-level task is the following:
{task}

## Action
The current action performed is:
{action}

## Action insights
The result of the action is:
{result}

## Previous summary
The summary that you made before:
{summary}
`;

export const prompt = ChatPromptTemplate.fromTemplate(template);
