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
