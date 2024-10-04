import { ChatPromptTemplate } from '@langchain/core/prompts';
import { KNOWLEDGE_SPACE } from 'lib/constants';

const template = `
I want you to act as my eyes. Given a global goal, a current
action being performed and its result you need to extract the most relevant
information from the result. Your insights must be list of plain facts which
respond to the global goal and to the currently performed action. Be cold,
distant, unemotional and be as detailed as the action requires you to be.
{rules}
## Examples

### Example global goal
You have access to a url shortener node.js project.
I want you to find exact API handler which shortens
a URL and document its algorithm into some file.

### Example action
Action: read directory root
Space: ${KNOWLEDGE_SPACE}
Intention: research
Goal: get insight for where to look for answer
Expected result: list of promising paths

### Example action result
/src
  /controllers
    a.ts
    b.ts
    url.ts
  /services
    cache.ts

### Your example response
1. There's file ./src/controllers/url.ts;
2. ./src/services/cache.ts might be interesting as well.

Begin!

## Global goal
The global goal is the following:
{task}

## Action
The current action performed is:
{action}

## Result of the action
The result of the action is:
{result}
`;

export const prompt = ChatPromptTemplate.fromTemplate(template);
