import type { CacheConfig, CachedElement } from "../caching/mod.ts";
import { isCachedElement } from "../caching/mod.ts";
import type { Element } from "../jsx-runtime/mod.ts";

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
): StatusElement {
  if (isCachedElement(page)) {
    return { [statusBrand]: true, code, page: page.page, cache: page.cache };
  }
  return { [statusBrand]: true, code, page };
}

/** True when `value` is a `status()` return. */
export function isStatusElement(value: unknown): value is StatusElement {
  return typeof value === "object" && value !== null && statusBrand in value;
}
