import { Project } from 'ts-morph';

import { findReferences as findReferencesBase, FindReferencesArgs } from './findReferences';
import { goToDefinition as goToDefinitionBase, GoToDefinitionArgs } from './goToDefinition';

let project: Project;

export const initialize = (directoryPath: string) => {
  project = new Project({
    compilerOptions: {
      baseUrl: directoryPath,
    },
  });
};

export const findReferences = (arg: FindReferencesArgs) => findReferencesBase(project, arg);
export const goToDefinition = (arg: GoToDefinitionArgs) => goToDefinitionBase(project, arg);
