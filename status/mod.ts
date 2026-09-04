import type { CacheConfig, CachedElement } from "../caching/mod.ts";
import { isCachedElement } from "../caching/mod.ts";
import type { Element } from "../jsx-runtime/mod.ts";
import type { Patch } from "../patching/mod.ts";

/** @internal */
const statusBrand: unique symbol = Symbol("dashi.status");

/** Markup with an HTTP status attached by `status()`. */
export interface StatusElement {
  /** @internal */
  readonly [statusBrand]: true;
  /** Document HTTP status. */
  readonly code: number;
  /** Rendered page body. */
  readonly page: Element;
  /** Cache policy when the page was wrapped in `cached()`. */
  readonly cache?: CacheConfig;
}

/** @internal */
export interface StatusPatches {
  readonly [statusBrand]: true;
  readonly code: number;
  readonly patches: readonly Patch[];
}

/**
 * Set the document HTTP status on a handler JSX return. Layouts still
 * wrap. A table miss uses the group's `notFound`. An auth redirect
 * stays a middleware `Response`.
 *
 * @param code Document HTTP status.
 * @param page Markup, or `cached()` markup whose policy is kept.
 *
 * @example
 * ```ts
 * return status(404, <p>Not found</p>);
 * ```
 */
export function status(
  code: number,
  page: Element | CachedElement,
): StatusElement;
/**
 * Set the HTTP status on a write handler's patch list. A bare list is
 * 200.
 *
 * @param code HTTP status.
 * @param patches Targeted updates to apply on the client.
 *
 * @example
 * ```ts
 * return status(400, [patch.replace("/todos", <TodoList error="title required" />)]);
 * ```
 */
export function status(
  code: number,
  patches: readonly Patch[],
): StatusPatches;
export function status(
  code: number,
  pageOrPatches: Element | CachedElement | readonly Patch[],
): StatusElement | StatusPatches {
  if (isPatchList(pageOrPatches)) {
    return { [statusBrand]: true, code, patches: pageOrPatches };
  }
  if (isCachedElement(pageOrPatches)) {
    return {
      [statusBrand]: true,
      code,
      page: pageOrPatches.page,
      cache: pageOrPatches.cache,
    };
  }
  return { [statusBrand]: true, code, page: pageOrPatches };
}

// Array.isArray does not exclude `readonly Patch[]` from the remaining union.
function isPatchList(
  value: Element | CachedElement | readonly Patch[],
): value is readonly Patch[] {
  return Array.isArray(value);
}

/** True when `value` is a `status()` document return. */
export function isStatusElement(value: unknown): value is StatusElement {
  return typeof value === "object" && value !== null && statusBrand in value &&
    "page" in value;
}

/** @internal */
export function isStatusPatches(value: unknown): value is StatusPatches {
  return typeof value === "object" && value !== null && statusBrand in value &&
    "patches" in value;
}
