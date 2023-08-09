import chai from "chai"

export function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== 'string') {
      throw new Error(`${value} must be a string`);
    }
}

export function assertKeysNotNullOrUndefined(obj: any, keys: string[], optional: boolean = false) {
  for (const key of keys) {
    if (optional) {
      if (!keys.some(key => Boolean(obj[key]))) {
        throw new Error(`Key "${key}" does not exist or is null/undefined`);
      }
    }else if (obj[key] == null) {
      throw new Error(`Key "${key}" does not exist or is null/undefined`);
    }
  }
}

export function assertArrayLength<T>(arr: T[], length: number): asserts arr is T[] & { length: typeof length } {
    if (arr.length !== length) {
      throw new Error(`Expected array of length ${length}, but got array of length ${arr.length}`);
    }
}

export function assertArray<T>(arr: T[]): asserts arr is T[] & { length: typeof length } {
    if (!arr.length || !Array.isArray(arr)) {
      throw new Error(`${arr} must be an array with minimum length 1`);
    }
}

export function assert(condition: boolean, message?: string): asserts condition {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
}

export function assertLength(item: any, length: number, message: string) {
  chai.assert.lengthOf(item, length, message)
}