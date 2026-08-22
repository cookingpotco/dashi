import { type DashiNode, type HTMLAttributes } from "dashi/jsx-runtime";
import { client } from "../client/mod.ts";
import { error as logError } from "../logging/mod.ts";
import { runRoute } from "../routing/mod.ts";
import { getFragmentSlot, getRenderStore } from "../ssr/mod.ts";

const RouteFragmentElement = client.element(
  "route-fragment",
  new URL("../client/routeFragment.ts", import.meta.url),
);

// So document.querySelector("route-fragment") is HTMLElement.
declare global {
  interface HTMLElementTagNameMap {
    "route-fragment": HTMLElement;
  }
}

type InternalSrc = `/${string}`;

interface BaseRouteFragmentProps extends HTMLAttributes {
  /**
   * Fragment is fetched from this location, either eagerly during SSR or after
   * load when `lazy` is set.
   *
   * Actions like form submissions will also be scoped to this path by default
   */
  src: InternalSrc;
}

interface LazyFragmentProps extends BaseRouteFragmentProps {
  /**
   * Will not render the fragment during SSR; it is fetched after page load.
   * Useful for deferring rendering and separating cache control.
   *
   * Passing `fallback` adds a pending UI until the actual fragment is loaded.
   */
  lazy: true;
  /**
   * Returned during SSR when `lazy` is set, until it's replaced by actual content
   */
  fallback?: DashiNode;
}

interface EagerFragmentProps extends BaseRouteFragmentProps {
  lazy?: never;
  fallback?: never;
}

type FragmentSlotProps = LazyFragmentProps | EagerFragmentProps;

function requestEagerFragment(src: string) {
  const store = getRenderStore();

  if (store.inflightFragments.has(src)) {
    return;
  }

  const url = new URL(src, store.pageReq.url);
  const headers = new Headers();
  const cookie = store.pageReq.headers.get("cookie");
  const authorization = store.pageReq.headers.get("authorization");
  if (cookie !== null) {
    headers.set("cookie", cookie);
  }
  if (authorization !== null) {
    headers.set("authorization", authorization);
  }

  const req = new Request(url, { method: "GET", headers });
  const promise = (async (): Promise<string | null> => {
    try {
      const out = await runRoute(req, {
        isFragment: true,
        state: { ...store.currentState },
        recoverMiss: false,
      });
      return out?.html ?? null;
    } catch (thrown) {
      logError(
        `[fragments] eager fragment failed: ${
          thrown instanceof Error ? thrown.message : thrown
        }`,
      );
      return null;
    }
  })();

  store.inflightFragments.set(src, promise);
}

export function RouteFragment(
  { src, lazy, fallback, ...rest }: FragmentSlotProps,
) {
  if (lazy) {
    return RouteFragmentElement({
      src,
      lazy: true,
      ...rest,
      children: fallback,
    });
  }

  requestEagerFragment(src);
  return RouteFragmentElement({
    src,
    ...rest,
    dangerouslySetInnerHTML: { __html: getFragmentSlot(src) },
  });
}
