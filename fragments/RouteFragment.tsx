import type { DashiNode, Element, HTMLAttributes } from "../jsx-runtime/mod.ts";
import { client } from "../client/mod.ts";
import type { InternalSrc } from "./actions.ts";
import { error as logError } from "../logging/mod.ts";
import { runRoute } from "../routing/mod.ts";
import { getFragmentSlot, getRenderStore } from "../ssr/mod.ts";

const RouteFragmentElement = client.element(
  "route-fragment",
  new URL("./route_fragment_client.ts", import.meta.url),
);

const DEFAULT_FRAGMENT_TIMEOUT_MS = 5000;

interface BaseRouteFragmentProps extends HTMLAttributes {
  /**
   * Fragment is fetched from this location, either eagerly during SSR or after
   * load when `lazy` is set.
   *
   * A form submitted inside this fragment is fetched as a fragment request.
   * A write handler returns `fragment.replace`, `fragment.append`, or
   * `fragment.remove` to update every host rendering those routes.
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
   * Shown during SSR when `lazy` is set. Stays until a successful body or a
   * nonempty error body replaces it.
   */
  fallback?: DashiNode;
  timeout?: never;
}

interface EagerFragmentProps extends BaseRouteFragmentProps {
  lazy?: never;
  fallback?: never;
  /**
   * Milliseconds to wait for this include during SSR. Omitted is 5000.
   * On timeout the include behaves as a handler throw.
   */
  timeout?: number;
}

type FragmentSlotProps = LazyFragmentProps | EagerFragmentProps;

function requestEagerFragment(src: string, timeoutMs: number) {
  const store = getRenderStore();

  if (store.includeChain.includes(src)) {
    store.fragmentFault.error = new Error(
      `Fragment cycle: ${[...store.includeChain, src].join(" → ")}`,
    );
    return;
  }
  const chain = [...store.includeChain, src];
  if (chain.length > store.fragmentDepthLimit) {
    store.fragmentFault.error = new Error(
      `Fragment depth exceeded (${store.fragmentDepthLimit}): ${
        chain.join(" → ")
      }`,
    );
    return;
  }
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
        timeoutMs,
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
  { src, lazy, fallback, timeout, ...rest }: FragmentSlotProps,
): Element {
  if (lazy) {
    return (
      <RouteFragmentElement src={src} lazy {...rest}>
        {fallback}
      </RouteFragmentElement>
    );
  }

  requestEagerFragment(src, timeout ?? DEFAULT_FRAGMENT_TIMEOUT_MS);
  return (
    <RouteFragmentElement
      src={src}
      {...rest}
      dangerouslySetInnerHTML={{ __html: getFragmentSlot(src) }}
    />
  );
}
