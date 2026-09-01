import "./controller_client.ts";

const fragmentHeaders = new Headers();
fragmentHeaders.append("Accept", "text/html");
fragmentHeaders.append("X-Fragment", "1");

class RouteFragment extends HTMLElement {
  private readonly lazyAttr: string | null;
  private readonly src: string;
  private loaded = false;
  private abort: AbortController | null = null;
  private observer: IntersectionObserver | null = null;

  constructor() {
    super();

    this.lazyAttr = this.getAttribute("lazy");

    const srcAttr = this.getAttribute("src");

    if (!srcAttr) {
      throw new Error("Missing required `src` field on fragment element");
    }

    this.src = srcAttr;
  }

  connectedCallback() {
    if (this.lazyAttr === null || this.loaded || this.abort !== null) {
      return;
    }
    if (this.lazyAttr !== "visible") {
      this.beginFetch();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      const entry = entries.find((e) => e.isIntersecting);
      if (!entry) {
        return;
      }
      observer.disconnect();
      if (this.observer === observer) {
        this.observer = null;
      }
      if (!this.isConnected || this.loaded || this.abort !== null) {
        return;
      }
      this.beginFetch();
    });
    this.observer = observer;
    observer.observe(this);
  }

  refresh(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.abort?.abort();
    this.beginFetch();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = null;
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.abort?.abort();
        this.abort = null;
      }
    });
  }

  private beginFetch() {
    const abort = new AbortController();
    this.abort = abort;
    void this.fetchAndSwap(abort);
  }

  private async fetchAndSwap(abort: AbortController) {
    this.setAttribute("aria-busy", "true");
    try {
      const res = await fetch(this.src, {
        method: "GET",
        headers: fragmentHeaders,
        signal: abort.signal,
      });
      if (abort.signal.aborted) {
        return;
      }
      await this.applyResponse(res, abort);
      if (!abort.signal.aborted) {
        this.loaded = true;
      }
    } catch {
      if (!abort.signal.aborted) {
        this.loaded = true;
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

  private async applyResponse(res: Response, abort: AbortController) {
    const html = await res.text();
    if (abort.signal.aborted) {
      return;
    }
    if (!res.ok && html === "") {
      return;
    }
    const link = res.headers.get("link") ?? "";
    const pending: Promise<unknown>[] = [];
    for (const match of link.matchAll(/<([^>]+)>;\s*rel="modulepreload"/g)) {
      const href = match[1];
      if (href !== undefined) {
        pending.push(import(new URL(href, location.href).href));
      }
    }
    await Promise.all(pending);
    if (abort.signal.aborted) {
      return;
    }
    if (!this.isConnected) {
      return;
    }
    this.innerHTML = html;
  }
}

customElements.define("route-fragment", RouteFragment);
