import { ChatPromptTemplate } from '@langchain/core/prompts';
import { spaces, spacesEnumeration } from 'lib/misc';
import { KNOWLEDGE_SPACE } from 'lib/constants';

const template = `
You're a helpful assistant operating in ${spaces.length} spaces: ${spacesEnumeration}.
Your goal is to choose the most appropriate tool and put proper parameters
based on a requested action. Your response must be in JSON format.
{rules}
## Examples

### Example requested action
Action: read directory root
Space: ${KNOWLEDGE_SPACE}
Intention: research
Goal: get insight for where to look for answer
Expected result: list of promising paths

### Example response
{{ name: 'directory-tree', args: {{ directoryPath: './', space: '${KNOWLEDGE_SPACE}' }} }}

Begin!

## Requested action
The action is:
{action}
`;

export const prompt = ChatPromptTemplate.fromTemplate(template);
