export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};

export function assertIsDefined<V>(value: V, message?: string): asserts value is Exclude<V, undefined> {
  if (value === undefined) {
    throw new Error(message ?? 'value is undefined');
  }
}
