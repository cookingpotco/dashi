import type { Element } from "../jsx-runtime/mod.ts";

/** CDN cache policy. Pick a member; `cached()` takes a `CacheConfig`. */
export const enum CacheStrategy {
  /** Shared cache, long-lived, never revalidate. */
  Immutable = "immutable",
  /** Shared cache with an age. */
  Public = "public",
  /** Browser cache only. */
  Private = "private",
  /** Do not cache. */
  NoStore = "no-store",
}

/** @internal */
export interface BaseCacheConfig {
  /**
   * Request header names for `Vary`. Cookie is the whole jar.
   * Public and Immutable refuse `Cookie` and `*`.
   */
  varyHeaders?: string[];
}

/** @internal */
export interface ImmutableCacheConfig extends BaseCacheConfig {
  strategy: CacheStrategy.Immutable;
}

/** @internal */
export interface PublicCacheConfig extends BaseCacheConfig {
  strategy: CacheStrategy.Public;
  maxAge: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  staleIfError?: number;
}

/** @internal */
export interface PrivateCacheConfig extends BaseCacheConfig {
  strategy: CacheStrategy.Private;
  maxAge: number;
  staleWhileRevalidate?: number;
}

/** @internal */
export interface NoStoreCacheConfig extends BaseCacheConfig {
  strategy: CacheStrategy.NoStore;
}

/** Cache policy bag passed to `cached()` and `staticFile()`. */
export type CacheConfig =
  | ImmutableCacheConfig
  | PublicCacheConfig
  | PrivateCacheConfig
  | NoStoreCacheConfig;

/** @internal */
const cachedBrand: unique symbol = Symbol("dashi.cached");

/** An `Element` with a cache policy attached by `cached()`. */
export interface CachedElement {
  /** @internal */
  readonly [cachedBrand]: true;
  /** Rendered page body. */
  readonly page: Element;
  /** Cache policy for this return. */
  readonly cache: CacheConfig;
}

/**
 * Attach a cache policy to an Element return. The most specific
 * `cached()` on the handler-to-layout walk wins. Omitted: `no-store`.
 * `varyHeaders` names request headers; Cookie is the whole jar;
 * Public and Immutable refuse `Cookie` and `*`.
 *
 * @param page Markup to cache.
 * @param cache Policy for this return.
 *
 * @example
 * ```ts
 * return cached(page, { strategy: CacheStrategy.Public, maxAge: 60 });
 * ```
 */
export function cached(page: Element, cache: CacheConfig): CachedElement {
  return { [cachedBrand]: true, page, cache };
}

export function isCachedElement(value: unknown): value is CachedElement {
  return typeof value === "object" && value !== null && cachedBrand in value;
}

/** Cache-Control value for a `CacheConfig`. */
export function cacheControl(cache: CacheConfig): string {
  if (cache.strategy === CacheStrategy.Immutable) {
    return "public, max-age=31536000, immutable";
  }
  if (cache.strategy === CacheStrategy.NoStore) {
    return "no-cache, no-store, max-age=0, must-revalidate";
  }
  if (cache.strategy === CacheStrategy.Private) {
    let header = `private, max-age=${cache.maxAge}`;
    if (cache.staleWhileRevalidate !== undefined) {
      header += `, stale-while-revalidate=${cache.staleWhileRevalidate}`;
    }
    return header;
  }
  let header = `public, max-age=${cache.maxAge}`;
  if (cache.sMaxAge !== undefined) {
    header += `, s-maxage=${cache.sMaxAge}`;
  }
  if (cache.staleWhileRevalidate !== undefined) {
    header += `, stale-while-revalidate=${cache.staleWhileRevalidate}`;
  }
  if (cache.staleIfError !== undefined) {
    header += `, stale-if-error=${cache.staleIfError}`;
  }
  return header;
}

/** Append Vary tokens without duplicates (case-insensitive). */
export function mergeVary(
  headers: Headers,
  tokens: readonly string[],
): void {
  const seen = new Set<string>();
  const merged: string[] = [];
  const existing = headers.get("Vary");
  if (existing !== null) {
    for (const part of existing.split(",")) {
      const token = part.trim();
      if (token === "") {
        continue;
      }
      const key = token.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push(token);
    }
  }
  for (const token of tokens) {
    const trimmed = token.trim();
    if (trimmed === "") {
      continue;
    }
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push(trimmed);
  }
  if (merged.length > 0) {
    headers.set("Vary", merged.join(", "));
  }
}

export function applyVaryHeaders(
  headers: Headers,
  cache: CacheConfig,
): void {
  if (!cache.varyHeaders) {
    return;
  }
  if (
    cache.strategy === CacheStrategy.Public ||
    cache.strategy === CacheStrategy.Immutable
  ) {
    for (const token of cache.varyHeaders) {
      const key = token.trim().toLowerCase();
      if (key === "cookie" || key === "*") {
        throw new Error(
          "Shared cache cannot Vary on Cookie (the whole jar) or * (every request). Use Private or NoStore, or Vary on a header the edge already copied.",
        );
      }
    }
  }
  mergeVary(headers, cache.varyHeaders);
}
