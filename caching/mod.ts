import type { Element } from "../jsx-runtime/mod.ts";

export const enum CacheStrategy {
  Immutable = "immutable",
  Public = "public",
  Private = "private",
}

export type CacheConfig =
  & (
    | { strategy: CacheStrategy.Immutable }
    | {
      strategy: CacheStrategy.Public;
      maxAge: number;
      sMaxAge?: number;
      staleWhileRevalidate?: number;
      staleIfError?: number;
    }
    | { strategy: CacheStrategy.Private }
  )
  & { vary?: string[] };

const cachedBrand: unique symbol = Symbol("dashi.cached");

export interface CachedElement {
  readonly [cachedBrand]: true;
  readonly page: Element;
  readonly cache: CacheConfig;
}

/**
 * Attach a cache policy to an Element return. The most specific
 * `cached()` on the handler-to-layout walk wins. Omitted: `private`.
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
  if (cache.strategy === CacheStrategy.Private) {
    return "private";
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
