import { counted } from 'helpers/formatting';

export const formatSteps = (steps: string[]) => {
  return steps.map((step: string, index: number) => {
    return `Step #${counted(step, index)}`;
  });
};
