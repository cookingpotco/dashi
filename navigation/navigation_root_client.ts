import {
  registerSoftNavigate,
  registerWriteHost,
  type SubmitIntent,
} from "../forms/submit_client.ts";

history.scrollRestoration = "manual";

const parser = new DOMParser();

let renderedUrl = new URL(location.href);
let connectedHost: NavigationRoot | null = null;
let inflight: AbortController | null = null;
let announcer: HTMLElement | null = null;

function samePath(a: URL, b: URL): boolean {
  return a.origin === b.origin && a.pathname === b.pathname &&
    a.search === b.search;
}

interface NavigateOptions {
  push: boolean;
  scroll?: number;
}

interface ParsedPage {
  host: Element;
  doc: Document;
}

function fallback(url: string, push: boolean): void {
  if (push) {
    location.assign(url);
  } else {
    location.reload();
  }
}

async function parseResponse(
  res: Response,
  abort: AbortController,
): Promise<ParsedPage | null> {
  const type = res.headers.get("content-type");
  if (type === null || !type.toLowerCase().startsWith("text/html")) {
    return null;
  }
  const html = await res.text();
  if (abort.signal.aborted) {
    return null;
  }
  const doc = parser.parseFromString(html, "text/html");
  const incomingHost = doc.querySelector("navigation-root");
  if (incomingHost === null) {
    return null;
  }
  const pending: Promise<unknown>[] = [];
  for (
    const script of doc.querySelectorAll("script[type=module][src]")
  ) {
    const src = script.getAttribute("src");
    if (src !== null) {
      pending.push(import(new URL(src, location.href).href));
    }
  }
  await Promise.all(pending);
  if (abort.signal.aborted) {
    return null;
  }
  return { host: incomingHost, doc };
}

// DOMParser documents resolve URLs against about:blank.
function getLinkedUrl(el: HTMLLinkElement | HTMLScriptElement): string {
  const attr = el instanceof HTMLScriptElement
    ? el.getAttribute("src")
    : el.getAttribute("href");
  if (attr === null || attr === "") {
    if (el instanceof HTMLScriptElement) {
      return el.src;
    }
    return el.href;
  }
  return new URL(attr, location.href).href;
}

function matchingLive(
  incoming: Node,
  live: Node[],
  kept: Set<Node>,
): Node | null {
  if (
    incoming instanceof HTMLLinkElement &&
    incoming.relList.contains("stylesheet")
  ) {
    const href = getLinkedUrl(incoming);
    for (const node of live) {
      if (
        !kept.has(node) &&
        node instanceof HTMLLinkElement &&
        node.relList.contains("stylesheet") &&
        getLinkedUrl(node) === href
      ) {
        return node;
      }
    }
    return null;
  }
  if (!(incoming instanceof HTMLScriptElement)) {
    return null;
  }
  const src = incoming.getAttribute("src");
  if (src === null || src === "") {
    return null;
  }
  const url = getLinkedUrl(incoming);
  for (const node of live) {
    if (
      !kept.has(node) &&
      node instanceof HTMLScriptElement &&
      getLinkedUrl(node) === url
    ) {
      return node;
    }
  }
  return null;
}

function waitForSheet(
  link: HTMLLinkElement,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      link.removeEventListener("load", done);
      link.removeEventListener("error", done);
      signal.removeEventListener("abort", done);
      resolve();
    };
    link.addEventListener("load", done);
    link.addEventListener("error", done);
    signal.addEventListener("abort", done);
    if (signal.aborted || link.sheet !== null) {
      done();
    }
  });
}

async function mergeHead(
  doc: Document,
  abort: AbortController,
): Promise<boolean> {
  const live = [...document.head.childNodes];
  const kept = new Set<Node>();
  const added: ChildNode[] = [];
  const sheets: HTMLLinkElement[] = [];

  for (const incoming of [...doc.head.childNodes]) {
    const match = matchingLive(incoming, live, kept);
    if (match !== null) {
      kept.add(match);
      continue;
    }
    if (incoming instanceof HTMLScriptElement) {
      continue;
    }
    const node = document.importNode(incoming, true);
    document.head.append(node);
    added.push(node);
    if (
      node instanceof HTMLLinkElement &&
      node.relList.contains("stylesheet")
    ) {
      sheets.push(node);
    }
  }

  await Promise.all(
    sheets.map((link) => waitForSheet(link, abort.signal)),
  );
  if (abort.signal.aborted) {
    for (const node of added) {
      node.remove();
    }
    return false;
  }

  for (const node of live) {
    if (kept.has(node)) {
      continue;
    }
    // Import maps stay; later import() still needs the live map.
    if (
      node instanceof HTMLScriptElement &&
      (node.getAttribute("src") === null || node.getAttribute("src") === "")
    ) {
      continue;
    }
    node.remove();
  }
  return true;
}

function copyLang(doc: Document): void {
  const lang = doc.documentElement.getAttribute("lang");
  if (lang === null) {
    document.documentElement.removeAttribute("lang");
  } else {
    document.documentElement.lang = lang;
  }
}

function announceTitle(): void {
  if (announcer === null) {
    const el = document.createElement("div");
    el.setAttribute("aria-live", "assertive");
    el.setAttribute("aria-atomic", "true");
    el.style.cssText =
      "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0";
    document.body.append(el);
    announcer = el;
  }
  announcer.textContent = "";
  announcer.textContent = document.title;
}

function focusAfterSwap(host: NavigationRoot): void {
  const autofocus = host.querySelector("[autofocus]");
  if (autofocus instanceof HTMLElement) {
    autofocus.focus({ preventScroll: true });
    return;
  }
  if (!host.hasAttribute("tabindex")) {
    host.tabIndex = -1;
  }
  host.focus({ preventScroll: true });
}

function restoreScroll(
  options: NavigateOptions,
): void {
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
}

async function commitDocument(
  host: NavigationRoot,
  parsed: ParsedPage,
  abort: AbortController,
  navigation: { url: string; options: NavigateOptions } | null,
): Promise<boolean> {
  if (!await mergeHead(parsed.doc, abort)) {
    return false;
  }
  copyLang(parsed.doc);
  if (navigation !== null) {
    history.replaceState(
      { ...history.state, dashiScroll: scrollY },
      "",
    );
    if (navigation.options.push) {
      history.pushState({ dashiScroll: 0 }, "", navigation.url);
    }
  }
  host.replaceChildren(
    ...document.importNode(parsed.host, true).childNodes,
  );
  if (navigation !== null) {
    renderedUrl = new URL(navigation.url, location.href);
    restoreScroll(navigation.options);
  }
  focusAfterSwap(host);
  announceTitle();
  return true;
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
    const parsed = await parseResponse(res, abort);
    if (abort.signal.aborted) {
      return;
    }
    if (parsed === null) {
      fallback(url, options.push);
      return;
    }
    await commitDocument(host, parsed, abort, {
      url: finalUrl,
      options,
    });
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

async function performSubmit(
  host: NavigationRoot,
  intent: SubmitIntent,
): Promise<void> {
  const abort = new AbortController();
  inflight = abort;
  host.setAttribute("aria-busy", "true");
  try {
    const res = await fetch(intent.url, {
      method: intent.method,
      headers: { Accept: "text/html" },
      body: intent.body,
      signal: abort.signal,
    });
    if (abort.signal.aborted) {
      return;
    }
    if (new URL(res.url, location.href).origin !== location.origin) {
      location.assign(res.url);
      return;
    }
    const parsed = await parseResponse(res, abort);
    if (abort.signal.aborted) {
      return;
    }
    if (parsed === null) {
      location.assign(res.url);
      return;
    }
    if (res.redirected) {
      await commitDocument(host, parsed, abort, {
        url: res.url,
        options: { push: true },
      });
      return;
    }
    await commitDocument(host, parsed, abort, null);
  } catch {
    if (abort.signal.aborted) {
      return;
    }
  } finally {
    if (inflight === abort) {
      inflight = null;
      host.removeAttribute("aria-busy");
    }
  }
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
    if (anchor.hasAttribute("hardnavigation")) {
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

registerWriteHost("navigation-root", (host, intent) => {
  if (!(host instanceof NavigationRoot)) {
    return;
  }
  // A second submit is dropped. A click still aborts this apply, so a
  // navigation can win; another POST cannot.
  if (inflight !== null) {
    return;
  }
  void performSubmit(host, intent);
});
registerSoftNavigate(navigate);

customElements.define("navigation-root", NavigationRoot);
