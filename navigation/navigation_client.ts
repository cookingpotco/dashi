history.scrollRestoration = "manual";

let renderedUrl = new URL(location.href);
let connectedHost: RouteNavigation | null = null;

function samePath(a: URL, b: URL): boolean {
  return a.origin === b.origin && a.pathname === b.pathname &&
    a.search === b.search;
}

interface NavigateOptions {
  push: boolean;
  scroll?: number;
}

class RouteNavigation extends HTMLElement {
  private abort: AbortController | null = null;

  connectedCallback() {
    if (connectedHost !== null && connectedHost !== this) {
      throw new Error(
        "Only one <route-navigation> may be connected per document",
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
    this.abort?.abort();
    this.abort = null;
  }

  private readonly onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0) {
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const el = event.target instanceof Element
      ? event.target
      : event.target instanceof Node
      ? event.target.parentElement
      : null;
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
    if (anchor.closest('[data-dashi-navigate="false"]') !== null) {
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
    void this.navigate(dest.href, { push: true });
  };

  private readonly onPopState = (event: PopStateEvent): void => {
    const dest = new URL(location.href);
    if (samePath(dest, renderedUrl)) {
      return;
    }
    const state = event.state;
    const scroll = state !== null && typeof state === "object" &&
        "dashiScroll" in state && typeof state.dashiScroll === "number"
      ? state.dashiScroll
      : 0;
    void this.navigate(dest.href, { push: false, scroll });
  };

  private fallback(url: string, push: boolean): void {
    if (push) {
      location.assign(url);
    } else {
      location.reload();
    }
  }

  private async navigate(url: string, options: NavigateOptions): Promise<void> {
    this.abort?.abort();
    const abort = new AbortController();
    this.abort = abort;
    this.setAttribute("aria-busy", "true");
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
        this.fallback(url, options.push);
        return;
      }
      const type = res.headers.get("content-type");
      if (type === null || !type.toLowerCase().startsWith("text/html")) {
        this.fallback(url, options.push);
        return;
      }
      const html = await res.text();
      if (abort.signal.aborted) {
        return;
      }
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const incomingHost = parsed.querySelector("route-navigation");
      if (incomingHost === null) {
        this.fallback(url, options.push);
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
      this.replaceChildren(
        ...document.importNode(incomingHost, true).childNodes,
      );
      renderedUrl = new URL(finalUrl, location.href);
      if (options.push) {
        const hash = renderedUrl.hash;
        if (hash.length > 1) {
          const target = document.getElementById(
            decodeURIComponent(hash.slice(1)),
          );
          if (target !== null) {
            target.scrollIntoView();
          } else {
            scrollTo(0, 0);
          }
        } else {
          scrollTo(0, 0);
        }
      } else {
        scrollTo(0, options.scroll ?? 0);
      }
    } catch {
      if (!abort.signal.aborted) {
        this.fallback(url, options.push);
      }
    } finally {
      if (this.abort === abort) {
        this.abort = null;
      }
      if (this.abort === null) {
        this.removeAttribute("aria-busy");
      }
    }
  }
}

customElements.define("route-navigation", RouteNavigation);
