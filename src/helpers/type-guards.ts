import * as z from 'zod';
import { AllKeys, PickType } from 'helpers/types';

export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};

export const isNotNil = <V>(value: V): value is Exclude<V, undefined | null> => {
  return value !== null && value !== undefined;
};

export function assertIsDefined<V>(value: V, message?: string): asserts value is Exclude<V, undefined> {
  if (value === undefined) {
    throw new Error(message ?? 'value is undefined');
  }
}

export function assertIsNotNil<V>(value: V, message?: string): asserts value is Exclude<V, undefined | null> {
  if (value === undefined || value === null) {
    throw new Error(message ?? 'value is nil');
  }
}

export function assertHasProperty<O extends {}, P extends AllKeys<O>, V extends PickType<O, P>>(
  value: O,
  property: P,
  message?: string,
): asserts value is O & Record<P, Exclude<V, undefined>> {
  if (!(property in value)) {
    throw new Error(message ?? `Object doesn't contain property '${String(property)}'`);
  }
}

export function assertMatchSchema<V>(schema: z.Schema, value: unknown): asserts value is V {
  schema.parse(value);
}
