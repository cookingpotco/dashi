import "./controller_client.ts";
import {
  isHtmlContentType,
  isRootRelativePath,
  isSameOrigin,
} from "../client/trust_client.ts";

const slotHeaders = new Headers();
slotHeaders.append("Accept", "text/html");
slotHeaders.append("X-Slot", "1");

class RouteSlot extends HTMLElement {
  private readonly fetchWhen: string | null;
  private readonly src: string;
  private loaded = false;
  private abort: AbortController | null = null;
  private observer: IntersectionObserver | null = null;

  constructor() {
    super();

    this.fetchWhen = this.getAttribute("fetchwhen");

    const srcAttr = this.getAttribute("src");

    if (!srcAttr) {
      throw new Error("Missing required `src` field on route-slot element");
    }
    if (!isRootRelativePath(srcAttr)) {
      throw new Error(
        "route-slot `src` must be a single-segment root-relative path; `//` and absolute URLs are not allowed",
      );
    }

    this.src = srcAttr;
  }

  connectedCallback() {
    if (this.fetchWhen === "visible") {
      if (this.loaded || this.abort !== null) {
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
      return;
    }
    if (this.loaded || this.abort !== null) {
      return;
    }
    this.beginFetch();
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
    if (
      !isRootRelativePath(this.src) ||
      !isSameOrigin(new URL(this.src, location.href))
    ) {
      this.loaded = true;
      return;
    }
    const abort = new AbortController();
    this.abort = abort;
    void this.fetchAndSwap(abort);
  }

  private async fetchAndSwap(abort: AbortController) {
    this.setAttribute("aria-busy", "true");
    try {
      const res = await fetch(this.src, {
        method: "GET",
        headers: slotHeaders,
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
    if (!isSameOrigin(res.url)) {
      return;
    }
    if (!isHtmlContentType(res.headers.get("content-type"))) {
      return;
    }
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
        const url = new URL(href, location.href);
        if (isSameOrigin(url)) {
          pending.push(import(url.href));
        }
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

customElements.define("route-slot", RouteSlot);
