const fragmentHeaders = new Headers();
fragmentHeaders.append("Accept", "text/html");
fragmentHeaders.append("X-Fragment", "1");

class RouteFragment extends HTMLElement {
  private readonly lazy: boolean;
  private readonly src: string;
  private loaded = false;
  private abort: AbortController | null = null;

  constructor() {
    super();

    this.lazy = this.getAttribute("lazy") !== null;

    const srcAttr = this.getAttribute("src");

    if (!srcAttr) {
      throw new Error("Missing required `src` field on fragment element");
    }

    this.src = srcAttr;
    this.addEventListener("submit", (event) => this.onSubmit(event));
  }

  connectedCallback() {
    if (!this.lazy || this.loaded || this.abort !== null) {
      return;
    }
    const abort = new AbortController();
    this.abort = abort;
    void this.fetchAndSwap(abort);
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.abort?.abort();
        this.abort = null;
      }
    });
  }

  private onSubmit(event: Event) {
    if (!(event.target instanceof HTMLFormElement)) {
      return;
    }
    const form = event.target;
    if (form.closest("route-fragment") !== this) {
      return;
    }
    const submitter = event instanceof SubmitEvent ? event.submitter : null;
    const formControl = submitter instanceof HTMLButtonElement ||
        submitter instanceof HTMLInputElement
      ? submitter
      : null;
    const method = formControl?.formMethod || form.method;
    if (method === "dialog") {
      return;
    }
    const action = formControl?.hasAttribute("formaction")
      ? formControl.formAction
      : form.action;
    const target = formControl?.hasAttribute("formtarget")
      ? formControl.formTarget
      : form.target;
    if (target !== "" || new URL(action).origin !== location.origin) {
      return;
    }
    if (this.abort !== null) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    const abort = new AbortController();
    this.abort = abort;
    void this.submitAndSwap(form, formControl, method, action, abort);
  }

  private async submitAndSwap(
    form: HTMLFormElement,
    submitter: HTMLButtonElement | HTMLInputElement | null,
    method: string,
    action: string,
    abort: AbortController,
  ) {
    this.setAttribute("aria-busy", "true");
    try {
      const formData = submitter
        ? new FormData(form, submitter)
        : new FormData(form);
      const encoded = new URLSearchParams(
        [...formData].filter((entry): entry is [string, string] =>
          typeof entry[1] === "string"
        ),
      );
      const init: RequestInit = {
        method,
        headers: fragmentHeaders,
        signal: abort.signal,
      };
      let url = action;
      if (method === "get") {
        const query = new URL(action);
        query.search = encoded.toString();
        url = query.href;
      } else if (form.enctype === "multipart/form-data") {
        init.body = formData;
      } else {
        init.body = encoded;
      }
      const res = await fetch(url, init);
      if (abort.signal.aborted) {
        return;
      }
      if (res.redirected) {
        // TODO(COO-26): in-place navigation instead of a full load
        location.assign(res.url);
        return;
      }
      await this.applyResponse(res, abort);
    } catch {
      return;
    } finally {
      if (this.abort === abort) {
        this.abort = null;
      }
      if (this.abort === null) {
        this.removeAttribute("aria-busy");
      }
    }
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
    const template = document.createElement("template");
    template.innerHTML = html;
    const actions: Element[] = [];
    let mixed = false;
    for (const node of template.content.childNodes) {
      if (!(node instanceof Element)) {
        continue;
      }
      if (node.localName !== "route-action") {
        mixed = true;
        break;
      }
      actions.push(node);
    }
    if (!mixed && actions.length > 0) {
      for (const action of actions) {
        applyAction(action);
      }
      return;
    }
    if (!this.isConnected) {
      return;
    }
    this.innerHTML = html;
  }
}

const enum SwapKind {
  Replace = "replace",
  Append = "append",
  Remove = "remove",
}

function applyAction(action: Element) {
  const kind = action.getAttribute("action");
  const src = action.getAttribute("src");
  if (src === null) {
    return;
  }
  const hosts = document.querySelectorAll(`route-fragment[src="${src}"]`);
  if (kind === SwapKind.Remove) {
    for (const host of hosts) {
      host.remove();
    }
    return;
  }
  if (kind === SwapKind.Replace) {
    for (const host of hosts) {
      host.innerHTML = action.innerHTML;
    }
    return;
  }
  if (kind === SwapKind.Append) {
    for (const host of hosts) {
      const clone = action.cloneNode(true);
      if (clone instanceof Element) {
        host.append(...clone.childNodes);
      }
    }
  }
}

customElements.define("route-fragment", RouteFragment);
