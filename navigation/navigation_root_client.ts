history.scrollRestoration = "manual";

const parser = new DOMParser();

let renderedUrl = new URL(location.href);
let connectedHost: NavigationRoot | null = null;
let inflight: AbortController | null = null;

function samePath(a: URL, b: URL): boolean {
  return a.origin === b.origin && a.pathname === b.pathname &&
    a.search === b.search;
}

interface NavigateOptions {
  push: boolean;
  scroll?: number;
}

function fallback(url: string, push: boolean): void {
  if (push) {
    location.assign(url);
  } else {
    location.reload();
  }
}

async function performNavigate(
  url: string,
  options: NavigateOptions,
): Promise<void> {
  const host = connectedHost;
  if (host === null) {
    fallback(url, options.push);
    return;
  }
  inflight?.abort();
  const abort = new AbortController();
  inflight = abort;
  host.setAttribute("aria-busy", "true");
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "text/html" },
      signal: abort.signal,
    });
    if (abort.signal.aborted) {
      return;
    }
    const finalUrl = res.redirected ? res.url : url;
    if (new URL(finalUrl, location.href).origin !== location.origin) {
      fallback(url, options.push);
      return;
    }
    const type = res.headers.get("content-type");
    if (type === null || !type.toLowerCase().startsWith("text/html")) {
      fallback(url, options.push);
      return;
    }
    const html = await res.text();
    if (abort.signal.aborted) {
      return;
    }
    const parsed = parser.parseFromString(html, "text/html");
    const incomingHost = parsed.querySelector("navigation-root");
    if (incomingHost === null) {
      fallback(url, options.push);
      return;
    }
    const pending: Promise<unknown>[] = [];
    for (
      const script of parsed.querySelectorAll("script[type=module][src]")
    ) {
      const src = script.getAttribute("src");
      if (src !== null) {
        pending.push(import(new URL(src, location.href).href));
      }
    }
    await Promise.all(pending);
    if (abort.signal.aborted) {
      return;
    }
    history.replaceState(
      { ...history.state, dashiScroll: scrollY },
      "",
    );
    if (options.push) {
      history.pushState({ dashiScroll: 0 }, "", finalUrl);
    }
    host.replaceChildren(
      ...document.importNode(incomingHost, true).childNodes,
    );
    renderedUrl = new URL(finalUrl, location.href);
    if (!options.push) {
      scrollTo(0, options.scroll ?? 0);
      return;
    }
    const hash = renderedUrl.hash;
    if (hash.length <= 1) {
      scrollTo(0, 0);
      return;
    }
    const target = document.getElementById(
      decodeURIComponent(hash.slice(1)),
    );
    if (target === null) {
      scrollTo(0, 0);
      return;
    }
    target.scrollIntoView();
  } catch {
    if (abort.signal.aborted) {
      return;
    }
    fallback(url, options.push);
  } finally {
    if (inflight === abort) {
      inflight = null;
      host.removeAttribute("aria-busy");
    }
  }
}

/**
 * Fetch `url` and swap the connected `<navigation-root>` in place.
 * Pushes history and scrolls to the top, or to the hash target.
 * Without a host, or when the response cannot be swapped, does a
 * real navigation.
 */
export function navigate(url: string | URL): Promise<void> {
  const dest = new URL(url, location.href);
  if (dest.origin !== location.origin) {
    location.assign(dest.href);
    return Promise.resolve();
  }
  if (samePath(dest, renderedUrl) && dest.hash !== renderedUrl.hash) {
    location.hash = dest.hash;
    return Promise.resolve();
  }
  return performNavigate(dest.href, { push: true });
}

class NavigationRoot extends HTMLElement {
  connectedCallback() {
    if (connectedHost !== null && connectedHost !== this) {
      throw new Error(
        "Only one <navigation-root> may be connected per document",
      );
    }
    connectedHost = this;
    document.addEventListener("click", this.onClick);
    globalThis.addEventListener("popstate", this.onPopState);
  }

  disconnectedCallback() {
    if (connectedHost === this) {
      connectedHost = null;
    }
    document.removeEventListener("click", this.onClick);
    globalThis.removeEventListener("popstate", this.onPopState);
    inflight?.abort();
    inflight = null;
  }

  private readonly onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0) {
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    let el: Element | null = null;
    if (event.target instanceof Element) {
      el = event.target;
    } else if (event.target instanceof Node) {
      el = event.target.parentElement;
    }
    if (el === null) {
      return;
    }
    const anchor = el.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) {
      return;
    }
    if (anchor.hasAttribute("download")) {
      return;
    }
    if (anchor.target !== "" && anchor.target !== "_self") {
      return;
    }
    if (anchor.hasAttribute("hardNavigation")) {
      return;
    }
    const dest = new URL(anchor.href);
    if (dest.origin !== location.origin) {
      return;
    }
    if (dest.protocol !== "http:" && dest.protocol !== "https:") {
      return;
    }
    if (samePath(dest, renderedUrl)) {
      return;
    }
    event.preventDefault();
    void performNavigate(dest.href, { push: true });
  };

  private readonly onPopState = (event: PopStateEvent): void => {
    const dest = new URL(location.href);
    if (samePath(dest, renderedUrl)) {
      return;
    }
    const state = event.state;
    let scroll = 0;
    if (
      state !== null && typeof state === "object" &&
      "dashiScroll" in state && typeof state.dashiScroll === "number"
    ) {
      scroll = state.dashiScroll;
    }
    void performNavigate(dest.href, { push: false, scroll });
  };
}

customElements.define("navigation-root", NavigationRoot);
