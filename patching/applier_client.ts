import { registerPatches } from "../client/registry_client.ts";

const enum SwapKind {
  Update = "update",
  Replace = "replace",
  Append = "append",
  Prepend = "prepend",
  Before = "before",
  After = "after",
  Remove = "remove",
  Refresh = "refresh",
}

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function cannotTakeChildren(host: Element): boolean {
  return VOID_ELEMENTS.has(host.localName);
}

function resolveIdHost(target: string): Element[] {
  if (!target.startsWith("#")) {
    return [];
  }
  const node = document.getElementById(target.slice(1));
  return node === null ? [] : [node];
}

function resolveRefreshHosts(route: string): Element[] {
  const hosts: Element[] = [];
  for (const el of document.querySelectorAll("route-slot")) {
    if (el.getAttribute("src") === route) {
      hosts.push(el);
    }
  }
  return hosts;
}

function applyPatch(item: Element) {
  const kind = item.getAttribute("kind");
  const target = item.getAttribute("target");
  if (target === null || kind === null) {
    return;
  }
  const hosts = kind === SwapKind.Refresh
    ? resolveRefreshHosts(target)
    : resolveIdHost(target);
  if (kind === SwapKind.Remove) {
    for (const host of hosts) {
      host.remove();
    }
    return;
  }
  if (kind === SwapKind.Update) {
    for (const host of hosts) {
      if (cannotTakeChildren(host)) {
        throw new Error(
          `patch update cannot replace children of <${host.localName}>; void elements cannot take children`,
        );
      }
      host.innerHTML = item.innerHTML;
    }
    return;
  }
  if (kind === SwapKind.Replace) {
    for (const host of hosts) {
      const clone = item.cloneNode(true);
      if (clone instanceof Element) {
        host.replaceWith(...clone.childNodes);
      }
    }
    return;
  }
  if (kind === SwapKind.Append) {
    for (const host of hosts) {
      const clone = item.cloneNode(true);
      if (clone instanceof Element) {
        host.append(...clone.childNodes);
      }
    }
    return;
  }
  if (kind === SwapKind.Prepend) {
    for (const host of hosts) {
      const clone = item.cloneNode(true);
      if (clone instanceof Element) {
        host.prepend(...clone.childNodes);
      }
    }
    return;
  }
  if (kind === SwapKind.Before) {
    for (const host of hosts) {
      const clone = item.cloneNode(true);
      if (clone instanceof Element) {
        host.before(...clone.childNodes);
      }
    }
    return;
  }
  if (kind === SwapKind.After) {
    for (const host of hosts) {
      const clone = item.cloneNode(true);
      if (clone instanceof Element) {
        host.after(...clone.childNodes);
      }
    }
    return;
  }
  if (kind === SwapKind.Refresh) {
    for (const host of hosts) {
      const refresh = Reflect.get(host, "refresh");
      if (typeof refresh === "function") {
        refresh.call(host);
      }
    }
  }
}

function applyPatches(html: string): boolean {
  const template = document.createElement("template");
  template.innerHTML = html;
  const list: Element[] = [];
  for (const node of template.content.childNodes) {
    if (!(node instanceof Element)) {
      continue;
    }
    if (node.localName !== "dashi-patch") {
      return false;
    }
    list.push(node);
  }
  if (list.length === 0) {
    return false;
  }
  try {
    for (const item of list) {
      applyPatch(item);
    }
    return true;
  } catch (err) {
    console.error("dashi: patch apply failed", err);
    throw err;
  }
}

registerPatches(applyPatches);
