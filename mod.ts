/**
 * @module
 *
 * Server-first JSX framework. App API: `serve`, routes, fragments, cache,
 * and the client factory.
 */

export {
  type CacheConfig,
  cached,
  type CachedElement,
  CacheStrategy,
} from "./caching/mod.ts";
export { client } from "./client/mod.ts";
export {
  fragment,
  type FragmentAction,
  RouteFragment,
} from "./fragments/mod.ts";
export { NavigationRoot } from "./navigation/mod.ts";
export { type Group, group, type ParamsOf } from "./routing/mod.ts";
export { serve } from "./serve/mod.ts";
export type { Ctx, WrapperCtx } from "./shared/mod.ts";
export { staticFile } from "./static/mod.ts";
