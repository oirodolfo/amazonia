import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import ts from "typescript";
import type tsserver from "typescript/lib/tsserverlibrary";

/* ================================================================================================
 * Constants
 * ============================================================================================== */

const DEFAULT_HELPER_MODULE = "@/typed-native";
const LANGUAGE_PLUGIN_NAME = "typed-native-language-service-plugin";
const LANGUAGE_PLUGIN_DIAGNOSTIC_CODE = 930_001;
const DEFAULT_SOURCE_DIRECTORIES = ["src", "packages", "apps", "tools", "scripts"] as const;
const IGNORED_DIRECTORIES = new Set(["node_modules", ".git", "dist", "build", "coverage", ".turbo"]);
const SUPPORTED_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts"]);

/* ================================================================================================
 * Shared Types
 * ============================================================================================== */

type AnyRecord = Record<PropertyKey, unknown>;
type StringKeyOf<T> = Extract<keyof T, string>;
type PropertyKeyOf<T> = Extract<keyof T, string | number | symbol>;
type Nullish = null | undefined;
type Falsy = false | 0 | 0n | "" | null | undefined;
type NonNullableValue<T> = T extends Nullish ? never : T;
type Truthy<T> = T extends Falsy ? never : T;

type EntryOf<T extends object> = {
  [K in StringKeyOf<T>]: readonly [K, T[K]];
}[StringKeyOf<T>];

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type NativeReplacement = {
  readonly nativeName: string;
  readonly helperName: string;
  readonly message: string;
};

type PluginConfig = {
  readonly helperModule?: string;
  readonly diagnosticCategory?: "suggestion" | "warning";
};

type CodemodOptions = {
  readonly root: string;
  readonly helperModule: string;
  readonly write: boolean;
  readonly dryRun: boolean;
};

type FileResult = {
  readonly filePath: string;
  readonly changed: boolean;
  readonly replacements: readonly string[];
};

/* ================================================================================================
 * Object Wrappers
 * REFACTOR: extract it to src/object.ts
 * ============================================================================================== */

/**
 * Returns own enumerable object keys while preserving the known key union.
 *
 * @remarks
 * Native `Object.keys()` returns `string[]`, which loses the relationship between the object
 * and its valid keys. This wrapper improves editor autocomplete and indexed access safety.
 *
 * @param obj - Object whose enumerable string keys should be returned.
 * @returns Keys typed as `Array<Extract<keyof T, string>>`.
 *
 * @example
 * const routes = { home: "/", admin: "/admin" } as const;
 * const keys = objectKeys(routes);
 * // output: keys is Array<"home" | "admin">
 */
export function objectKeys<const T extends object>(obj: T): Array<StringKeyOf<T>> {
  return Object.keys(obj) as Array<StringKeyOf<T>>;
}

/**
 * Returns own enumerable object values while preserving the value union.
 *
 * @remarks
 * Native `Object.values()` often widens values too much. This wrapper keeps literal values
 * visible to the editor.
 *
 * @param obj - Object whose values should be returned.
 * @returns Values typed as `Array<T[keyof T]>`.
 *
 * @example
 * const status = { draft: "DRAFT", published: "PUBLISHED" } as const;
 * const values = objectValues(status);
 * // output: values is Array<"DRAFT" | "PUBLISHED">
 */
export function objectValues<const T extends object>(obj: T): Array<T[StringKeyOf<T>]> {
  return Object.values(obj) as Array<T[StringKeyOf<T>]>;
}

/**
 * Returns typed object entries while preserving key/value relationships.
 *
 * @remarks
 * Native `Object.entries()` returns broad tuples. This wrapper keeps each tuple as `[K, T[K]]`.
 *
 * @param obj - Object whose entries should be returned.
 * @returns Typed object entries.
 *
 * @example
 * const user = { id: 1, name: "Rod" } as const;
 * const entries = objectEntries(user);
 * // output: entries is Array<["id", 1] | ["name", "Rod"]>
 */
export function objectEntries<const T extends object>(obj: T): Array<EntryOf<T>> {
  return Object.entries(obj) as Array<EntryOf<T>>;
}

/**
 * Builds a typed object from typed entries.
 *
 * @remarks
 * Native `Object.fromEntries()` returns a broad object. This wrapper reconstructs the object
 * shape from literal tuple entries.
 *
 * @param entries - Readonly key-value tuples.
 * @returns Object reconstructed from entries.
 *
 * @example
 * const result = objectFromEntries([["name", "Rod"], ["age", 32]] as const);
 * // output: result is { name: "Rod"; age: 32 }
 */
export function objectFromEntries<const T extends readonly (readonly [PropertyKey, unknown])[]>(
  entries: T,
): { [K in T[number] as K[0]]: K[1] } {
  return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] };
}

/**
 * Checks whether an object owns a property and narrows the key.
 *
 * @remarks
 * Native `Object.hasOwn()` returns only `boolean`. This wrapper turns it into a type guard.
 *
 * @param obj - Object to inspect.
 * @param key - Candidate property key.
 * @returns Whether the object owns the key.
 *
 * @example
 * const user = { id: 1, name: "Rod" };
 * const key: string = "name";
 * if (hasOwn(user, key)) user[key];
 * // output: key is narrowed to "id" | "name"
 */
export function hasOwn<const T extends object>(obj: T, key: PropertyKey): key is PropertyKeyOf<T> {
  return Object.hasOwn(obj, key);
}

/**
 * Picks selected keys from an object.
 *
 * @remarks
 * Manual dynamic picking usually loses type precision. This wrapper returns `Pick<T, K>`.
 *
 * @param obj - Source object.
 * @param keys - Keys to keep.
 * @returns Object containing only selected keys.
 *
 * @example
 * const user = { id: 1, name: "Rod", password: "secret" };
 * const safe = pick(user, ["id", "name"] as const);
 * // output: safe is { id: number; name: string }
 */
export function pick<const T extends object, const K extends readonly StringKeyOf<T>[]>(
  obj: T,
  keys: K,
): Pick<T, K[number]> {
  const result = {} as Pick<T, K[number]>;

  for (const key of keys) {
    result[key] = obj[key];
  }

  return result;
}

/**
 * Omits selected keys from an object.
 *
 * @remarks
 * Dynamic omit operations can widen the result. This wrapper preserves `Omit<T, K>`.
 *
 * @param obj - Source object.
 * @param keys - Keys to remove.
 * @returns Object without selected keys.
 *
 * @example
 * const user = { id: 1, name: "Rod", password: "secret" };
 * const safe = omit(user, ["password"] as const);
 * // output: safe is { id: number; name: string }
 */
export function omit<const T extends object, const K extends readonly StringKeyOf<T>[]>(
  obj: T,
  keys: K,
): Omit<T, K[number]> {
  const blocked = new Set<PropertyKey>(keys);
  const result = {} as Omit<T, K[number]>;

  for (const key of objectKeys(obj)) {
    if (!blocked.has(key)) {
      (result as Record<string, unknown>)[key] = obj[key];
    }
  }

  return result;
}

/**
 * Maps object values while preserving original keys.
 *
 * @remarks
 * Native `Object.entries().map()` loses key information. This wrapper keeps the same object
 * keys and changes only the value type.
 *
 * @param obj - Source object.
 * @param mapper - Value mapper.
 * @returns Object with the same keys and mapped values.
 *
 * @example
 * const result = mapValues({ a: 1, b: 2 }, value => String(value));
 * // output: result is { a: string; b: string }
 */
export function mapValues<const T extends object, R>(
  obj: T,
  mapper: <K extends StringKeyOf<T>>(value: T[K], key: K) => R,
): { [K in StringKeyOf<T>]: R } {
  const result = {} as { [K in StringKeyOf<T>]: R };

  for (const key of objectKeys(obj)) {
    result[key] = mapper(obj[key], key);
  }

  return result;
}

/**
 * Maps object keys while preserving mapped value types.
 *
 * @remarks
 * This improves DX over manual `reduce()` because the callback contract is explicit.
 *
 * @param obj - Source object.
 * @param mapper - Key mapper.
 * @returns Object with mapped string keys.
 *
 * @example
 * const result = mapKeys({ firstName: "Rod" }, key => key.toUpperCase());
 * // output: result is Record<string, string>
 */
export function mapKeys<const T extends object>(
  obj: T,
  mapper: <K extends StringKeyOf<T>>(key: K, value: T[K]) => string,
): Record<string, T[StringKeyOf<T>]> {
  const result: Record<string, T[StringKeyOf<T>]> = {};

  for (const key of objectKeys(obj)) {
    result[mapper(key, obj[key])] = obj[key];
  }

  return result;
}

/**
 * Filters an object by key and value.
 *
 * @remarks
 * This is the object equivalent of `Array.filter()`, but keeps a safer partial result type.
 *
 * @param obj - Source object.
 * @param predicate - Filter predicate.
 * @returns Partial object containing accepted properties.
 *
 * @example
 * const result = filterObject({ a: 1, b: 2 }, value => value > 1);
 * // output: result is Partial<{ a: number; b: number }>
 */
export function filterObject<const T extends object>(
  obj: T,
  predicate: <K extends StringKeyOf<T>>(value: T[K], key: K) => boolean,
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of objectKeys(obj)) {
    if (predicate(obj[key], key)) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Assigns objects with a stronger intersection return type.
 *
 * @remarks
 * Native `Object.assign()` can be awkward with generics. This wrapper provides a concise,
 * editor-friendly merged type.
 *
 * @param target - Target object.
 * @param source - Source object.
 * @returns Merged object.
 *
 * @example
 * const result = typedAssign({ a: 1 }, { b: "x" });
 * // output: result is { a: number } & { b: string }
 */
export function typedAssign<const T extends object, const U extends object>(target: T, source: U): T & U {
  return Object.assign(target, source);
}

/**
 * Freezes an object while preserving its exact shape.
 *
 * @remarks
 * Native `Object.freeze()` is already typed, but this wrapper keeps a consistent helper API
 * and improves discoverability in internal toolkits.
 *
 * @param obj - Object to freeze.
 * @returns Readonly frozen object.
 *
 * @example
 * const result = typedFreeze({ mode: "prod" } as const);
 * // output: result is Readonly<{ readonly mode: "prod" }>
 */
export function typedFreeze<const T extends object>(obj: T): Readonly<T> {
  return Object.freeze(obj);
}

/* ================================================================================================
 * Array and Tuple Wrappers
 * REFACTOR: extract it to src/array.ts
 * ============================================================================================== */

/**
 * Creates a strongly typed tuple.
 *
 * @remarks
 * This preserves literal positions and is excellent for allowlists, registries and commands.
 *
 * @param values - Tuple values.
 * @returns The same values as a readonly tuple.
 *
 * @example
 * const modes = tuple("dev", "prod", "test");
 * // output: modes is readonly ["dev", "prod", "test"]
 */
export function tuple<const T extends readonly unknown[]>(...values: T): T {
  return values;
}

/**
 * Creates a mutable tuple.
 *
 * @remarks
 * Useful when you want literal inference but still need mutation in a controlled scope.
 *
 * @param values - Tuple values.
 * @returns Mutable tuple.
 *
 * @example
 * const pair = mutableTuple("x", 1);
 * // output: pair is ["x", 1]
 */
export function mutableTuple<const T extends readonly unknown[]>(...values: T): Mutable<T> {
  return values as Mutable<T>;
}

/**
 * Checks whether an array includes a value and narrows the value to the array union.
 *
 * @remarks
 * Native `Array.includes()` returns `boolean`. This wrapper works as a type guard.
 *
 * @param array - Literal array of allowed values.
 * @param item - Candidate value.
 * @returns Whether the item belongs to the array.
 *
 * @example
 * const roles = ["admin", "user"] as const;
 * const value: string = "admin";
 * if (includes(roles, value)) value;
 * // output: value is "admin" | "user"
 */
export function includes<const T extends readonly unknown[]>(array: T, item: unknown): item is T[number] {
  return array.includes(item as T[number]);
}

/**
 * Short alias for `includes()`.
 *
 * @remarks
 * Reads nicely for allowlists: `if (has(commands, input))`.
 *
 * @param array - Literal array of allowed values.
 * @param item - Candidate value.
 * @returns Whether the item belongs to the array.
 *
 * @example
 * const commands = ["build", "test"] as const;
 * const input: string = "build";
 * if (has(commands, input)) input;
 * // output: input is "build" | "test"
 */
export function has<const T extends readonly unknown[]>(array: T, item: unknown): item is T[number] {
  return includes(array, item);
}

/**
 * Narrows a value to non-nullish.
 *
 * @remarks
 * Prefer this over `filter(Boolean)` when you only want to remove `null` and `undefined`.
 *
 * @param value - Value to inspect.
 * @returns Whether the value is not nullish.
 *
 * @example
 * const result = [1, null, 2, undefined].filter(isNonNullable);
 * // output: result is number[]
 */
export function isNonNullable<T>(value: T): value is NonNullableValue<T> {
  return value !== null && value !== undefined;
}

/**
 * Narrows a value to truthy.
 *
 * @remarks
 * TypeScript does not infer `filter(Boolean)` precisely. This helper does.
 *
 * @param value - Value to inspect.
 * @returns Whether the value is truthy.
 *
 * @example
 * const result = ["a", "", "b", null] as const;
 * const clean = result.filter(isTruthy);
 * // output: clean is Array<"a" | "b">
 */
export function isTruthy<T>(value: T): value is Truthy<T> {
  return Boolean(value);
}

/**
 * Returns the first array item.
 *
 * @remarks
 * Native `array[0]` is fine, but this helper documents optionality and improves pipeline DX.
 *
 * @param array - Source array.
 * @returns First item or undefined.
 *
 * @example
 * const result = first(["a", "b"] as const);
 * // output: result is "a" | "b" | undefined
 */
export function first<const T extends readonly unknown[]>(array: T): T[number] | undefined {
  return array[0];
}

/**
 * Returns the last array item.
 *
 * @remarks
 * Native `array.at(-1)` may be typed broadly depending on lib settings. This helper keeps
 * the item union.
 *
 * @param array - Source array.
 * @returns Last item or undefined.
 *
 * @example
 * const result = last(["a", "b"] as const);
 * // output: result is "a" | "b" | undefined
 */
export function last<const T extends readonly unknown[]>(array: T): T[number] | undefined {
  return array.at(-1);
}

/**
 * Removes duplicate array items.
 *
 * @remarks
 * Native `[...new Set(array)]` is concise, but this helper preserves item union and intent.
 *
 * @param array - Source array.
 * @returns Array with unique items.
 *
 * @example
 * const result = unique(["a", "b", "a"] as const);
 * // output: result is Array<"a" | "b">
 */
export function unique<const T extends readonly unknown[]>(array: T): Array<T[number]> {
  return [...new Set(array)] as Array<T[number]>;
}

/**
 * Splits an array into chunks.
 *
 * @remarks
 * This avoids magic loops in application code and keeps item types stable.
 *
 * @param array - Source array.
 * @param size - Chunk size.
 * @returns Array chunks.
 *
 * @example
 * const result = chunk([1, 2, 3], 2);
 * // output: [[1, 2], [3]]
 */
export function chunk<const T extends readonly unknown[]>(array: T, size: number): Array<Array<T[number]>> {
  if (size <= 0) {
    throw new RangeError("Chunk size must be greater than zero.");
  }

  const result: Array<Array<T[number]>> = [];

  for (let index = 0; index < array.length; index += size) {
    result.push(array.slice(index, index + size) as Array<T[number]>);
  }

  return result;
}

/**
 * Partitions an array using a predicate.
 *
 * @remarks
 * Replaces two separate filters with one pass.
 *
 * @param array - Source array.
 * @param predicate - Partition predicate.
 * @returns Tuple containing matching and non-matching items.
 *
 * @example
 * const result = partition([1, 2, 3], value => value > 1);
 * // output: [[2, 3], [1]]
 */
export function partition<const T extends readonly unknown[]>(
  array: T,
  predicate: (value: T[number], index: number) => boolean,
): [Array<T[number]>, Array<T[number]>] {
  const yes: Array<T[number]> = [];
  const no: Array<T[number]> = [];

  array.forEach((value, index) => {
    if (predicate(value, index)) {
      yes.push(value as T[number]);
    } else {
      no.push(value as T[number]);
    }
  });

  return [yes, no];
}

/**
 * Groups array items by a property key.
 *
 * @remarks
 * This is a typed alternative to ad-hoc `reduce()` groupers.
 *
 * @param array - Source array.
 * @param getKey - Key resolver.
 * @returns Record of grouped items.
 *
 * @example
 * const result = groupBy(["one", "two"], value => value.length);
 * // output: Record<PropertyKey, string[]>
 */
export function groupBy<const T extends readonly unknown[], K extends PropertyKey>(
  array: T,
  getKey: (value: T[number], index: number) => K,
): Record<K, Array<T[number]>> {
  const result = {} as Record<K, Array<T[number]>>;

  array.forEach((value, index) => {
    const key = getKey(value as T[number], index);
    result[key] ??= [];
    result[key].push(value as T[number]);
  });

  return result;
}

/* ================================================================================================
 * Map Wrappers
 * REFACTOR: extract it to src/map.ts
 * ============================================================================================== */

/**
 * Creates a typed map from entries.
 *
 * @remarks
 * This preserves key and value unions from literal entries better than direct constructor use.
 *
 * @param entries - Map entries.
 * @returns Typed map.
 *
 * @example
 * const map = typedMap([["a", 1], ["b", 2]] as const);
 * // output: Map<"a" | "b", 1 | 2>
 */
export function typedMap<const T extends readonly (readonly [unknown, unknown])[]>(
  entries: T,
): Map<T[number][0], T[number][1]> {
  return new Map(entries as Iterable<readonly [T[number][0], T[number][1]]>);
}

/**
 * Gets a map value or throws.
 *
 * @remarks
 * Native `map.get()` returns `V | undefined`. This helper is useful when missing keys are
 * exceptional and you want clean downstream types.
 *
 * @param map - Source map.
 * @param key - Key to read.
 * @returns Existing map value.
 *
 * @example
 * const value = mapGetOrThrow(new Map([["id", 1]]), "id");
 * // output: value is number
 */
export function mapGetOrThrow<K, V>(map: ReadonlyMap<K, V>, key: K): V {
  const value = map.get(key);

  if (value === undefined && !map.has(key)) {
    throw new Error(`Missing map key: ${String(key)}`);
  }

  return value as V;
}

/**
 * Gets an existing map value or creates it.
 *
 * @remarks
 * This avoids repeated `has/get/set` boilerplate and keeps the returned type as `V`.
 *
 * @param map - Mutable map.
 * @param key - Key to read or create.
 * @param createValue - Factory for missing values.
 * @returns Existing or created value.
 *
 * @example
 * const map = new Map<string, number>();
 * const value = mapGetOrSet(map, "count", () => 1);
 * // output: value is number
 */
export function mapGetOrSet<K, V>(map: Map<K, V>, key: K, createValue: () => V): V {
  if (map.has(key)) {
    return map.get(key) as V;
  }

  const value = createValue();
  map.set(key, value);

  return value;
}

/**
 * Returns typed map keys.
 *
 * @remarks
 * Wraps `map.keys()` into an array for better pipeline ergonomics.
 *
 * @param map - Source map.
 * @returns Map keys.
 *
 * @example
 * const result = mapKeysArray(new Map([["a", 1]]));
 * // output: result is string[]
 */
export function mapKeysArray<K, V>(map: ReadonlyMap<K, V>): K[] {
  return [...map.keys()];
}

/**
 * Returns typed map values.
 *
 * @remarks
 * Wraps `map.values()` into an array while preserving value type.
 *
 * @param map - Source map.
 * @returns Map values.
 *
 * @example
 * const result = mapValuesArray(new Map([["a", 1]]));
 * // output: result is number[]
 */
export function mapValuesArray<K, V>(map: ReadonlyMap<K, V>): V[] {
  return [...map.values()];
}

/**
 * Maps map values while preserving keys.
 *
 * @remarks
 * This is the `Map` equivalent of `mapValues()`.
 *
 * @param map - Source map.
 * @param mapper - Value mapper.
 * @returns New map with same keys and mapped values.
 *
 * @example
 * const result = mapMapValues(new Map([["a", 1]]), value => String(value));
 * // output: Map<string, string>
 */
export function mapMapValues<K, V, R>(map: ReadonlyMap<K, V>, mapper: (value: V, key: K) => R): Map<K, R> {
  const result = new Map<K, R>();

  for (const [key, value] of map) {
    result.set(key, mapper(value, key));
  }

  return result;
}

/* ================================================================================================
 * Set Wrappers
 * REFACTOR: extract it to src/set.ts
 * ============================================================================================== */

/**
 * Creates a typed set from literal values.
 *
 * @remarks
 * Preserves literal item unions from readonly arrays.
 *
 * @param values - Source values.
 * @returns Typed set.
 *
 * @example
 * const result = typedSet(["dev", "prod"] as const);
 * // output: Set<"dev" | "prod">
 */
export function typedSet<const T extends readonly unknown[]>(values: T): Set<T[number]> {
  return new Set(values) as Set<T[number]>;
}

/**
 * Checks set membership and narrows the item to the set value type.
 *
 * @remarks
 * Native `set.has()` returns boolean. This wrapper can narrow unknown candidates.
 *
 * @param set - Source set.
 * @param item - Candidate item.
 * @returns Whether the item belongs to the set.
 *
 * @example
 * const set = typedSet(["a", "b"] as const);
 * const value: string = "a";
 * if (setHas(set, value)) value;
 * // output: value is "a" | "b"
 */
export function setHas<const T>(set: ReadonlySet<T>, item: unknown): item is T {
  return set.has(item as T);
}

/**
 * Returns the union of two sets.
 *
 * @remarks
 * Provides a typed helper even in runtimes where newer Set methods are unavailable.
 *
 * @param left - First set.
 * @param right - Second set.
 * @returns Union set.
 *
 * @example
 * const result = setUnion(new Set(["a"]), new Set(["b"]));
 * // output: Set<string>
 */
export function setUnion<A, B>(left: ReadonlySet<A>, right: ReadonlySet<B>): Set<A | B> {
  return new Set<A | B>([...left, ...right]);
}

/**
 * Returns the intersection of two sets.
 *
 * @remarks
 * Keeps the result typed as values from the left set that overlap at runtime.
 *
 * @param left - First set.
 * @param right - Second set.
 * @returns Intersection set.
 *
 * @example
 * const result = setIntersection(new Set(["a", "b"]), new Set(["b"]));
 * // output: Set<string>
 */
export function setIntersection<T>(left: ReadonlySet<T>, right: ReadonlySet<T>): Set<T> {
  return new Set([...left].filter((value) => right.has(value)));
}

/**
 * Returns values from the left set that do not exist in the right set.
 *
 * @remarks
 * Useful for diffing registries, file lists and dependency graphs.
 *
 * @param left - Source set.
 * @param right - Set of excluded values.
 * @returns Difference set.
 *
 * @example
 * const result = setDifference(new Set(["a", "b"]), new Set(["b"]));
 * // output: Set<"a">
 */
export function setDifference<T>(left: ReadonlySet<T>, right: ReadonlySet<T>): Set<T> {
  return new Set([...left].filter((value) => !right.has(value)));
}

/* ================================================================================================
 * Function and Promise Wrappers
 * REFACTOR: extract it to src/function.ts
 * ============================================================================================== */

/**
 * Returns the provided value unchanged.
 *
 * @remarks
 * Useful as a default mapper while preserving generic inference.
 *
 * @param value - Value to return.
 * @returns The same value.
 *
 * @example
 * const result = identity("x" as const);
 * // output: result is "x"
 */
export function identity<const T>(value: T): T {
  return value;
}

/**
 * Executes a side effect and returns the original value.
 *
 * @remarks
 * Helpful in pipelines where logging or inspection should not change the value type.
 *
 * @param value - Value to inspect.
 * @param effect - Side-effect callback.
 * @returns The original value.
 *
 * @example
 * const result = tap(1, value => console.log(value));
 * // output: result is 1
 */
export function tap<const T>(value: T, effect: (value: T) => void): T {
  effect(value);
  return value;
}

/**
 * Creates a function that can only run once.
 *
 * @remarks
 * Keeps the original return type and avoids repeated initialization.
 *
 * @param fn - Function to wrap.
 * @returns Function that memoizes the first call.
 *
 * @example
 * const init = once(() => ({ ready: true }));
 * const result = init();
 * // output: result is { ready: boolean }
 */
export function once<Args extends readonly unknown[], R>(fn: (...args: Args) => R): (...args: Args) => R {
  let called = false;
  let value: R;

  return (...args: Args): R => {
    if (!called) {
      called = true;
      value = fn(...args);
    }

    return value;
  };
}

/**
 * Resolves an object of promises while preserving object keys.
 *
 * @remarks
 * Native `Promise.all()` is great for arrays. This helper gives the same DX for objects.
 *
 * @param input - Object containing promise-like values.
 * @returns Object with resolved values.
 *
 * @example
 * const result = await promiseAllObject({ user: Promise.resolve("Rod") });
 * // output: result is { user: string }
 */
export async function promiseAllObject<const T extends Record<string, PromiseLike<unknown> | unknown>>(
  input: T,
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const entries = await Promise.all(
    objectEntries(input).map(async ([key, value]) => [key, await value] as const),
  );

  return objectFromEntries(entries) as { [K in keyof T]: Awaited<T[K]> };
}

/* ================================================================================================
 * JSON and Guards
 * REFACTOR: extract it to src/json.ts and src/guards.ts
 * ============================================================================================== */

/**
 * Parses JSON as unknown instead of any.
 *
 * @remarks
 * Native `JSON.parse()` returns `any`, which disables type safety. This wrapper forces callers
 * to validate or narrow the parsed value.
 *
 * @param input - JSON string.
 * @returns Parsed JSON as unknown.
 *
 * @example
 * const result = parseJsonUnknown('{"name":"Rod"}');
 * // output: result is unknown
 */
export function parseJsonUnknown(input: string): unknown {
  return JSON.parse(input) as unknown;
}

/**
 * Parses JSON and validates it with a type guard.
 *
 * @remarks
 * This keeps parsing and validation together, returning `T` only after the guard succeeds.
 *
 * @param input - JSON string.
 * @param guard - Runtime type guard.
 * @returns Validated parsed value.
 *
 * @example
 * const result = parseJsonAs('{"name":"Rod"}', (value): value is { name: string } =>
 *   typeof value === "object" && value !== null && "name" in value
 * );
 * // output: result is { name: string }
 */
export function parseJsonAs<T>(input: string, guard: (value: unknown) => value is T): T {
  const value = parseJsonUnknown(input);

  if (!guard(value)) {
    throw new TypeError("Invalid JSON shape.");
  }

  return value;
}

/**
 * Defines a config object while preserving literal inference.
 *
 * @remarks
 * This follows the familiar `defineConfig()` DX pattern used by modern tooling.
 *
 * @param config - Config object.
 * @returns The same config object.
 *
 * @example
 * const config = defineConfig({ mode: "production", debug: false });
 * // output: config.mode is "production"
 */
export function defineConfig<const T extends object>(config: T): T {
  return config;
}

/**
 * Asserts exhaustive handling of discriminated unions.
 *
 * @remarks
 * Use this in `switch` defaults to make TypeScript fail when a new union case is not handled.
 *
 * @param value - Impossible value.
 * @returns Never returns.
 *
 * @example
 * type Mode = "dev" | "prod";
 * function label(mode: Mode) {
 *   switch (mode) {
 *     case "dev": return "Development";
 *     case "prod": return "Production";
 *     default: return assertNever(mode);
 *   }
 * }
 * // output: adding a new Mode breaks compilation until handled
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}

/* ================================================================================================
 * Language Service Plugin
 * REFACTOR: extract it to tools/typed-native-language-service-plugin.ts
 * ============================================================================================== */

const NATIVE_REPLACEMENTS: readonly NativeReplacement[] = [
  {
    nativeName: "Object.keys",
    helperName: "objectKeys",
    message: "Use objectKeys() to preserve keyof inference instead of widening keys to string[].",
  },
  {
    nativeName: "Object.values",
    helperName: "objectValues",
    message: "Use objectValues() to preserve the object's value union.",
  },
  {
    nativeName: "Object.entries",
    helperName: "objectEntries",
    message: "Use objectEntries() to preserve key/value tuple relationships.",
  },
  {
    nativeName: "Object.fromEntries",
    helperName: "objectFromEntries",
    message: "Use objectFromEntries() to reconstruct a typed object from typed entries.",
  },
  {
    nativeName: "Object.hasOwn",
    helperName: "hasOwn",
    message: "Use hasOwn() as a key-narrowing type guard.",
  },
  {
    nativeName: "JSON.parse",
    helperName: "parseJsonUnknown",
    message: "Use parseJsonUnknown() to avoid leaking any from JSON.parse().",
  },
];

/**
 * Creates the TypeScript Language Service Plugin.
 *
 * @remarks
 * This improves editor DX by surfacing suggestions and code fixes. It does not change emit.
 *
 * @param mod - TypeScript server module.
 * @returns Plugin module.
 *
 * @example
 * export = initTypedNativeLanguageServicePlugin;
 * // output: tsserver loads editor diagnostics and code fixes
 */
export function initTypedNativeLanguageServicePlugin(mod: {
  readonly typescript: typeof tsserver;
}): tsserver.server.PluginModule {
  const tsModule = mod.typescript;

  return {
    create(info) {
      const config = normalizePluginConfig(info.config);
      const oldLanguageService = info.languageService;
      const proxy = Object.create(null) as tsserver.LanguageService;

      for (const key of Object.keys(oldLanguageService) as Array<keyof tsserver.LanguageService>) {
        const value = oldLanguageService[key];

        proxy[key] =
          typeof value === "function"
            ? ((...args: readonly unknown[]) => Reflect.apply(value, oldLanguageService, args)) as never
            : value;
      }

      proxy.getSemanticDiagnostics = (fileName) => {
        const prior = oldLanguageService.getSemanticDiagnostics(fileName);
        const sourceFile = oldLanguageService.getProgram()?.getSourceFile(fileName);

        if (!sourceFile) {
          return prior;
        }

        return [...prior, ...collectPluginDiagnostics(tsModule, sourceFile, config)];
      };

      return proxy;
    },
  };
}

/**
 * Normalizes language service plugin config.
 *
 * @remarks
 * Plugin config comes from JSON, so this guard keeps the plugin internals strongly typed.
 *
 * @param input - Raw plugin config.
 * @returns Normalized plugin config.
 *
 * @example
 * const config = normalizePluginConfig({ helperModule: "@/typed-native" });
 * // output: config.helperModule === "@/typed-native"
 */
function normalizePluginConfig(input: unknown): Required<PluginConfig> {
  const raw = isRecord(input) ? input : {};

  return {
    helperModule: typeof raw.helperModule === "string" ? raw.helperModule : DEFAULT_HELPER_MODULE,
    diagnosticCategory: raw.diagnosticCategory === "warning" ? "warning" : "suggestion",
  };
}

/**
 * Collects plugin diagnostics for replaceable native calls.
 *
 * @remarks
 * Syntax-only scanning keeps editor latency low.
 *
 * @param tsModule - TypeScript server module.
 * @param sourceFile - Source file to inspect.
 * @param config - Plugin config.
 * @returns Editor diagnostics.
 *
 * @example
 * const diagnostics = collectPluginDiagnostics(ts, sourceFile, config);
 * // output: diagnostics is ts.DiagnosticWithLocation[]
 */
function collectPluginDiagnostics(
  tsModule: typeof tsserver,
  sourceFile: tsserver.SourceFile,
  config: Required<PluginConfig>,
): tsserver.DiagnosticWithLocation[] {
  const diagnostics: tsserver.DiagnosticWithLocation[] = [];

  const visit = (node: tsserver.Node): void => {
    const replacement = getNativeReplacement(tsModule, node);

    if (replacement && tsModule.isCallExpression(node)) {
      diagnostics.push({
        file: sourceFile,
        start: node.expression.getStart(sourceFile),
        length: node.expression.getWidth(sourceFile),
        code: LANGUAGE_PLUGIN_DIAGNOSTIC_CODE,
        category:
          config.diagnosticCategory === "warning"
            ? tsModule.DiagnosticCategory.Warning
            : tsModule.DiagnosticCategory.Suggestion,
        messageText: replacement.message,
        source: LANGUAGE_PLUGIN_NAME,
      });
    }

    tsModule.forEachChild(node, visit);
  };

  visit(sourceFile);

  return diagnostics;
}

/**
 * Matches native calls supported by this toolkit.
 *
 * @remarks
 * The matcher is intentionally conservative and only supports direct member calls.
 *
 * @param tsModule - TypeScript server module.
 * @param node - Node to inspect.
 * @returns Native replacement metadata.
 *
 * @example
 * const replacement = getNativeReplacement(ts, call);
 * // output: replacement?.helperName could be "objectKeys"
 */
function getNativeReplacement(tsModule: typeof tsserver, node: tsserver.Node): NativeReplacement | undefined {
  if (!tsModule.isCallExpression(node) || !tsModule.isPropertyAccessExpression(node.expression)) {
    return undefined;
  }

  const nativeName = node.expression.getText();

  return NATIVE_REPLACEMENTS.find((replacement) => replacement.nativeName === nativeName);
}

/* ================================================================================================
 * Codemod CLI
 * REFACTOR: extract it to tools/typed-native-codemod.ts
 * ============================================================================================== */

/**
 * Runs the typed-native codemod CLI.
 *
 * @remarks
 * Rewrites explicit native calls to typed wrappers and guarantees named imports.
 *
 * @returns A promise that resolves after processing.
 *
 * @example
 * await runTypedNativeCodemodCli();
 * // output: files are scanned and optionally rewritten
 */
export async function runTypedNativeCodemodCli(): Promise<void> {
  const options = parseCodemodOptions(process.argv.slice(2));
  const root = await resolveWorkspaceRoot(options.root);
  const files = await collectSourceFiles(root);
  const results: FileResult[] = [];

  logInfo(`Root: ${root}`);
  logInfo(`Helper module: ${options.helperModule}`);
  logInfo(`Mode: ${options.write ? "write" : "dry-run"}`);
  logInfo(`Files found: ${files.length}`);

  for (const filePath of files) {
    const result = await processSourceFile(filePath, options);

    if (result.changed) {
      results.push(result);
    }
  }

  printCodemodSummary(results, options);
}

/**
 * Parses codemod CLI options.
 *
 * @remarks
 * Dependency-free parsing keeps the file portable.
 *
 * @param args - Raw CLI args.
 * @returns Parsed options.
 *
 * @example
 * const options = parseCodemodOptions(["--root", ".", "--write"]);
 * // output: options.write === true
 */
function parseCodemodOptions(args: readonly string[]): CodemodOptions {
  let root = ".";
  let helperModule = DEFAULT_HELPER_MODULE;
  let write = false;
  let dryRun = true;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--root") {
      root = args[index + 1] ?? ".";
      index += 1;
      continue;
    }

    if (arg === "--helper-module") {
      helperModule = args[index + 1] ?? DEFAULT_HELPER_MODULE;
      index += 1;
      continue;
    }

    if (arg === "--write") {
      write = true;
      dryRun = false;
      continue;
    }

    if (arg === "--dry-run") {
      write = false;
      dryRun = true;
    }
  }

  return { root, helperModule, write, dryRun };
}

/**
 * Resolves the workspace root from any nested directory.
 *
 * @remarks
 * This improves DX because the codemod can be run from package folders.
 *
 * @param preferredRoot - Preferred starting root.
 * @returns Absolute workspace root.
 *
 * @example
 * const root = await resolveWorkspaceRoot(".");
 * // output: root is an absolute path
 */
async function resolveWorkspaceRoot(preferredRoot: string): Promise<string> {
  let current = path.resolve(preferredRoot);

  while (true) {
    if (await exists(path.join(current, "pnpm-workspace.yaml"))) {
      return current;
    }

    if (await exists(path.join(current, "package.json"))) {
      return current;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      return path.resolve(preferredRoot);
    }

    current = parent;
  }
}

/**
 * Collects source files from common monorepo folders.
 *
 * @remarks
 * Generated and dependency folders are skipped to avoid noisy rewrites.
 *
 * @param root - Workspace root.
 * @returns Source files.
 *
 * @example
 * const files = await collectSourceFiles("/repo");
 * // output: files is string[]
 */
async function collectSourceFiles(root: string): Promise<string[]> {
  const files: string[] = [];

  for (const directory of DEFAULT_SOURCE_DIRECTORIES) {
    const absolute = path.join(root, directory);

    if (await exists(absolute)) {
      await walkDirectory(absolute, files);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

/**
 * Walks a directory recursively.
 *
 * @remarks
 * Declaration files are skipped because generated type surfaces should not be rewritten.
 *
 * @param directory - Directory to scan.
 * @param files - Mutable file list.
 * @returns Nothing.
 *
 * @example
 * await walkDirectory("src", files);
 * // output: files receives supported source paths
 */
async function walkDirectory(directory: string, files: string[]): Promise<void> {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) {
        await walkDirectory(absolute, files);
      }

      continue;
    }

    if (entry.isFile() && !entry.name.endsWith(".d.ts") && SUPPORTED_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }
}

/**
 * Processes one source file.
 *
 * @remarks
 * Uses TypeScript AST transforms instead of regex replacements.
 *
 * @param filePath - File to process.
 * @param options - Codemod options.
 * @returns Processing result.
 *
 * @example
 * const result = await processSourceFile("src/index.ts", options);
 * // output: result.changed tells whether the file would change
 */
async function processSourceFile(filePath: string, options: CodemodOptions): Promise<FileResult> {
  const sourceText = await fs.readFile(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, getScriptKind(filePath));

  if (hasLocalShadowForNativeObjects(sourceFile)) {
    return { filePath, changed: false, replacements: [] };
  }

  const replacements = new Set<string>();
  const transformer = createCodemodTransformer(replacements);
  const result = ts.transform(sourceFile, [transformer]);
  const transformed = result.transformed[0];

  if (!transformed || replacements.size === 0) {
    result.dispose();
    return { filePath, changed: false, replacements: [] };
  }

  const withImports = ensureNamedImports(transformed, [...replacements], options.helperModule);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: false });
  const nextText = printer.printFile(withImports);

  result.dispose();

  if (nextText !== sourceText && options.write) {
    await fs.writeFile(filePath, nextText, "utf8");
  }

  return {
    filePath,
    changed: nextText !== sourceText,
    replacements: [...replacements].sort(),
  };
}

/**
 * Creates the codemod transformer.
 *
 * @remarks
 * Replaces supported native callees while preserving arguments and generic type arguments.
 *
 * @param replacements - Mutable helper import set.
 * @returns Transformer factory.
 *
 * @example
 * const transformer = createCodemodTransformer(new Set());
 * // output: transformer rewrites Object.keys(...) to objectKeys(...)
 */
function createCodemodTransformer(replacements: Set<string>): ts.TransformerFactory<ts.SourceFile> {
  return (context) => {
    const visit = (node: ts.Node): ts.Node => {
      if (ts.isCallExpression(node)) {
        const rule = getCodemodReplacementRule(node);

        if (rule) {
          replacements.add(rule.helperName);

          return context.factory.updateCallExpression(
            node,
            context.factory.createIdentifier(rule.helperName),
            node.typeArguments,
            node.arguments,
          );
        }
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (file) => ts.visitNode(file, visit) as ts.SourceFile;
  };
}

/**
 * Finds a codemod rule for a call expression.
 *
 * @remarks
 * Only direct calls like `Object.keys(value)` are rewritten.
 *
 * @param node - Call expression.
 * @returns Replacement rule.
 *
 * @example
 * const rule = getCodemodReplacementRule(call);
 * // output: rule?.helperName could be "objectKeys"
 */
function getCodemodReplacementRule(node: ts.CallExpression): NativeReplacement | undefined {
  if (!ts.isPropertyAccessExpression(node.expression)) {
    return undefined;
  }

  const nativeName = node.expression.getText();

  return NATIVE_REPLACEMENTS.find((rule) => rule.nativeName === nativeName);
}

/**
 * Adds missing named helper imports.
 *
 * @remarks
 * Existing helper imports are reused and extended to avoid duplicate imports.
 *
 * @param sourceFile - Source file.
 * @param helperNames - Helper names to import.
 * @param helperModule - Helper module specifier.
 * @returns Updated source file.
 *
 * @example
 * const updated = ensureNamedImports(sourceFile, ["objectKeys"], "@/typed-native");
 * // output: source file has an objectKeys named import
 */
function ensureNamedImports(sourceFile: ts.SourceFile, helperNames: readonly string[], helperModule: string): ts.SourceFile {
  const uniqueHelpers = [...new Set(helperNames)].sort();

  if (uniqueHelpers.length === 0) {
    return sourceFile;
  }

  const existingImport = sourceFile.statements.find((statement): statement is ts.ImportDeclaration => {
    return (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === helperModule
    );
  });

  if (existingImport) {
    return updateExistingHelperImport(sourceFile, existingImport, uniqueHelpers);
  }

  return insertNewHelperImport(sourceFile, uniqueHelpers, helperModule);
}

/**
 * Updates an existing helper import declaration.
 *
 * @remarks
 * Keeps import specifiers sorted for stable diffs.
 *
 * @param sourceFile - Source file.
 * @param declaration - Existing import declaration.
 * @param helperNames - Required helper names.
 * @returns Updated source file.
 *
 * @example
 * const updated = updateExistingHelperImport(sourceFile, declaration, ["objectKeys"]);
 * // output: declaration includes objectKeys
 */
function updateExistingHelperImport(
  sourceFile: ts.SourceFile,
  declaration: ts.ImportDeclaration,
  helperNames: readonly string[],
): ts.SourceFile {
  const importClause = declaration.importClause;
  const namedBindings = importClause?.namedBindings;

  if (!importClause || !namedBindings || !ts.isNamedImports(namedBindings)) {
    return sourceFile;
  }

  const currentNames = namedBindings.elements.map((element) => element.name.text);
  const nextNames = [...new Set([...currentNames, ...helperNames])].sort();

  const nextDeclaration = ts.factory.updateImportDeclaration(
    declaration,
    declaration.modifiers,
    ts.factory.updateImportClause(
      importClause,
      importClause.isTypeOnly,
      importClause.name,
      ts.factory.updateNamedImports(
        namedBindings,
        nextNames.map((name) => ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))),
      ),
    ),
    declaration.moduleSpecifier,
    declaration.attributes,
  );

  return ts.factory.updateSourceFile(
    sourceFile,
    sourceFile.statements.map((statement) => (statement === declaration ? nextDeclaration : statement)),
  );
}

/**
 * Inserts a new helper import declaration.
 *
 * @remarks
 * The import is inserted after existing imports for clean editor organization.
 *
 * @param sourceFile - Source file.
 * @param helperNames - Helper names.
 * @param helperModule - Helper module specifier.
 * @returns Updated source file.
 *
 * @example
 * const updated = insertNewHelperImport(sourceFile, ["objectKeys"], "@/typed-native");
 * // output: source file has a new named import
 */
function insertNewHelperImport(sourceFile: ts.SourceFile, helperNames: readonly string[], helperModule: string): ts.SourceFile {
  const importDeclaration = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports(
        helperNames.map((name) => ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))),
      ),
    ),
    ts.factory.createStringLiteral(helperModule),
    undefined,
  );

  const statements = [...sourceFile.statements];
  const lastImportIndex = statements.findLastIndex(ts.isImportDeclaration);
  statements.splice(lastImportIndex >= 0 ? lastImportIndex + 1 : 0, 0, importDeclaration);

  return ts.factory.updateSourceFile(sourceFile, statements);
}

/**
 * Detects local shadows for native globals.
 *
 * @remarks
 * If a file declares `Object`, `Array` or `JSON`, rewriting is skipped for safety.
 *
 * @param sourceFile - Source file to inspect.
 * @returns Whether a native global is shadowed.
 *
 * @example
 * const unsafe = hasLocalShadowForNativeObjects(sourceFile);
 * // output: true means skip codemod for this file
 */
function hasLocalShadowForNativeObjects(sourceFile: ts.SourceFile): boolean {
  const nativeRoots = new Set(["Object", "Array", "JSON"]);
  let shadowed = false;

  const visit = (node: ts.Node): void => {
    if (shadowed) {
      return;
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && nativeRoots.has(node.name.text)) {
      shadowed = true;
      return;
    }

    if (ts.isFunctionDeclaration(node) && node.name && nativeRoots.has(node.name.text)) {
      shadowed = true;
      return;
    }

    if (ts.isClassDeclaration(node) && node.name && nativeRoots.has(node.name.text)) {
      shadowed = true;
      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return shadowed;
}

/**
 * Resolves TypeScript script kind.
 *
 * @remarks
 * Correct script kind keeps TSX files parsed correctly.
 *
 * @param filePath - Source file path.
 * @returns Script kind.
 *
 * @example
 * const kind = getScriptKind("component.tsx");
 * // output: ts.ScriptKind.TSX
 */
function getScriptKind(filePath: string): ts.ScriptKind {
  return filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}

/**
 * Checks whether a path exists.
 *
 * @remarks
 * Keeps filesystem probing readable.
 *
 * @param targetPath - Path to check.
 * @returns Whether the path exists.
 *
 * @example
 * const found = await exists("package.json");
 * // output: boolean
 */
async function exists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks whether a value is a non-null record.
 *
 * @remarks
 * Useful for safely reading unknown JSON or plugin config objects.
 *
 * @param value - Value to inspect.
 * @returns Whether the value is a record.
 *
 * @example
 * const result = isRecord({ a: 1 });
 * // output: true
 */
function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null;
}

/**
 * Prints a codemod summary.
 *
 * @remarks
 * Dry-run output lets you review changes before writing.
 *
 * @param results - Changed file results.
 * @param options - Codemod options.
 * @returns Nothing.
 *
 * @example
 * printCodemodSummary(results, options);
 * // output: summary is printed to stdout
 */
function printCodemodSummary(results: readonly FileResult[], options: CodemodOptions): void {
  logInfo("");
  logInfo("Typed native codemod summary");
  logInfo(`Changed files: ${results.length}`);

  for (const result of results) {
    logInfo(`- ${path.relative(process.cwd(), result.filePath)}: ${result.replacements.join(", ")}`);
  }

  if (options.dryRun) {
    logInfo("");
    logInfo("Dry-run only. Re-run with --write to update files.");
  }
}

/**
 * Logs an informational message.
 *
 * @remarks
 * Small wrapper to make replacing stdout with a richer logger easy later.
 *
 * @param message - Message to print.
 * @returns Nothing.
 *
 * @example
 * logInfo("Done");
 * // output: "Done" is printed
 */
function logInfo(message: string): void {
  process.stdout.write(`${message}\n`);
}

if (process.argv[1] && path.basename(process.argv[1]) === path.basename(import.meta.url.replace("file://", ""))) {
  void runTypedNativeCodemodCli().catch((error: unknown) => {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}