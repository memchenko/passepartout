import { ChatPromptTemplate } from '@langchain/core/prompts';

const template = `
{rules}
## The goal
{goal}

## File content
`;

export const prompt = ChatPromptTemplate.fromTemplate(template);
