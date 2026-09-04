import {
  type DashiNode,
  type Element,
  type HTMLAttributes,
  jsx,
} from "../jsx-runtime/mod.ts";
import { client } from "../client/mod.ts";
import { Logger } from "../logging/mod.ts";
import { runRoute } from "../routing/mod.ts";
import { getFragmentSlot, getRenderStore } from "../ssr/mod.ts";

const RouteFragmentElement = client.element(
  "route-fragment",
  new URL("./route_fragment_client.ts", import.meta.url),
);

const DEFAULT_FRAGMENT_TIMEOUT_MS = 5000;

/** @internal */
interface BaseRouteFragmentProps extends HTMLAttributes {
  /**
   * Fragment is fetched from this location, either eagerly during SSR or after
   * connect when `lazy` is set.
   *
   * A GET or lazy fetch replaces this host with markup. A write handler
   * returns `patch.replace`, `patch.append`, `patch.prepend`,
   * `patch.before`, `patch.after`, `patch.remove`, or `patch.refresh`
   * to update every host rendering those routes, or a `#id` in the live
   * document. Use `replace` when the write has the markup; use `refresh`
   * when fragments should re-fetch themselves asynchronously.
   */
  src: `/${string}`;
}

/** @internal */
interface ConnectLazyFragmentProps extends BaseRouteFragmentProps {
  /**
   * Skip SSR and fetch after the host connects.
   *
   * Passing `fallback` adds a pending UI until the actual fragment is loaded.
   */
  lazy: true;
  /**
   * Shown during SSR when `lazy` is set. Stays until a successful body or a
   * nonempty error body replaces it.
   */
  fallback?: DashiNode;
  timeout?: never;
}

/** @internal */
interface VisibleLazyFragmentProps extends BaseRouteFragmentProps {
  /**
   * Skip SSR and fetch on first viewport intersection. `fallback` is required
   * so the host has something to paint and a box to intersect.
   */
  lazy: "visible";
  /**
   * Shown during SSR. Stays until a successful body or a nonempty error body
   * replaces it.
   */
  fallback: DashiNode;
  timeout?: never;
}

/** @internal */
interface EagerFragmentProps extends BaseRouteFragmentProps {
  lazy?: never;
  fallback?: never;
  /**
   * Milliseconds to wait for this include during SSR. Omitted is 5000.
   * On timeout the include behaves as a handler throw.
   */
  timeout?: number;
}

/** @internal */
type FragmentSlotProps =
  | ConnectLazyFragmentProps
  | VisibleLazyFragmentProps
  | EagerFragmentProps;

function resolveFragmentSrc(src: string, base: string): {
  identity: string;
  pathname: string;
  url: URL;
} {
  const url = new URL(src, base);
  return {
    identity: `${url.pathname}${url.search}`,
    pathname: url.pathname,
    url,
  };
}

function requestEagerFragment(src: string, timeoutMs: number): string {
  const store = getRenderStore();
  const { identity, pathname, url } = resolveFragmentSrc(
    src,
    store.pageReq.url,
  );

  if (store.includeSignal?.aborted) {
    return identity;
  }
  if (store.includeChain.includes(pathname)) {
    store.fragmentFault.error = new Error(
      `Fragment cycle: ${[...store.includeChain, pathname].join(" → ")}`,
    );
    return identity;
  }
  const chain = [...store.includeChain, pathname];
  if (chain.length > store.fragmentDepthLimit) {
    store.fragmentFault.error = new Error(
      `Fragment depth exceeded (${store.fragmentDepthLimit}): ${
        chain.join(" → ")
      }`,
    );
    return identity;
  }
  if (store.inflightFragments.has(identity)) {
    return identity;
  }

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
        timeoutMs,
      });
      if (!out) {
        return null;
      }
      return await out.text();
    } catch (thrown) {
      Logger.error(["fragments"], "eager fragment failed", thrown);
      return null;
    }
  })();

  store.inflightFragments.set(identity, promise);
  return identity;
}

/**
 * Include another route's rendered output. Eager during SSR, `lazy` after
 * connect, or `lazy="visible"` on first viewport intersection.
 *
 * @param src Path to fetch, like `/todos`.
 * @param lazy `true` skips SSR and fetches after connect. `"visible"` skips
 * SSR and fetches on first intersection; `fallback` is required.
 * @param fallback Shown while a lazy fragment is loading. Stays until a
 * successful body or a nonempty error body.
 * @param timeout Milliseconds to wait during SSR. Omitted is 5000.
 *
 * @example
 * ```tsx
 * <RouteFragment src="/todos" lazy fallback={<p>Loading…</p>} />
 * <RouteFragment src="/demo" lazy="visible" fallback={<p>Loading…</p>} />
 * ```
 */
export function RouteFragment(
  { src, lazy, fallback, timeout, ...rest }: FragmentSlotProps,
): Element {
  if (lazy) {
    const { identity } = resolveFragmentSrc(src, getRenderStore().pageReq.url);
    return jsx(RouteFragmentElement, {
      src: identity,
      lazy,
      ...rest,
      children: fallback,
    });
  }

  const identity = requestEagerFragment(
    src,
    timeout ?? DEFAULT_FRAGMENT_TIMEOUT_MS,
  );
  return jsx(RouteFragmentElement, {
    src: identity,
    ...rest,
    dangerouslySetInnerHTML: { __html: getFragmentSlot(identity) },
  });
}
