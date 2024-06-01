import { Actor } from './types';

export function assertActor<A extends Actor<ActorType, any> = Actor<ActorType, any>>(
  actor: any,
  type?: ActorType,
): asserts actor is A {
  if (!type) {
    if (!actor.type) {
      throw new Error('Actor is not selected.');
    } else {
      return;
    }
  }

  if (actor.type !== type) {
    throw new Error('Incorrect actor state.');
  }
}
