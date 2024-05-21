import { Project, SyntaxKind } from 'ts-morph';

import { assertIsDefined } from 'helpers/type-guards';

export interface GoToDefinitionArgs {
  filePath: string;
  line: number;
  name: string;
}

export const goToDefinition = (project: Project, { filePath, line, name }: GoToDefinitionArgs) => {
  const srcFile = project.addSourceFileAtPath(filePath);
  const descendants = srcFile.getDescendantsOfKind(SyntaxKind.Identifier);
  const identifier = descendants.find((node) => {
    const isAppropriateLine = node.getStartLineNumber() === line;
    const isAppropriateName = node.getSymbol()?.getEscapedName() === name;

    return isAppropriateLine && isAppropriateName;
  });

  assertIsDefined(identifier, `File ${filePath} doesn't contain ${name} on line ${line}`);

  return identifier
    .getDefinitionNodes()
    .map((node) => {
      const implementation = node.getNextSiblingOrThrow().getFullText();
      const filePath = node.getSourceFile().getFilePath();
      const line = node.getStartLineNumber();

      return { filePath, line, implementation };
    })
    .filter(({ filePath }) => {
      return !filePath.includes('node_modules');
    });
};
