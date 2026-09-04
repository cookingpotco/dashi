/**
 * @module
 *
 * Server-first JSX framework. App API: `serve`, routes, fragments, cache,
 * and the client factory.
 */

export { type CacheConfig, CacheStrategy } from "./caching/mod.ts";
export { client } from "./client/mod.ts";
export { RouteFragment } from "./fragments/mod.ts";
export { type Patch, patch } from "./patching/mod.ts";
export { NavigationRoot } from "./navigation/mod.ts";
export { type Group, group, type ParamsOf } from "./routing/mod.ts";
export { serve } from "./serve/mod.ts";
export type {
  Ctx,
  SealHtml,
  SealOptions,
  SealPatches,
  WrapperCtx,
} from "./shared/mod.ts";
export { staticFile } from "./static/mod.ts";
