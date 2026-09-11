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

customElements.define("route-slot", RouteSlot);
