import { registerPatches } from "../client/registry_client.ts";
import "../forms/submit_client.ts";

const enum SwapKind {
  Replace = "replace",
  Append = "append",
  Prepend = "prepend",
  Before = "before",
  After = "after",
  Remove = "remove",
  Refresh = "refresh",
}

function resolveHosts(target: string): Iterable<Element> {
  if (target.startsWith("#")) {
    const node = document.getElementById(target.slice(1));
    return node === null ? [] : [node];
  }
  return document.querySelectorAll(`route-fragment[src="${target}"]`);
}

function applyPatch(item: Element) {
  const kind = item.getAttribute("kind");
  const target = item.getAttribute("target");
  if (target === null) {
    return;
  }
  const hosts = resolveHosts(target);
  if (kind === SwapKind.Remove) {
    for (const host of hosts) {
      host.remove();
    }
    return;
  }
  if (kind === SwapKind.Replace) {
    for (const host of hosts) {
      host.innerHTML = item.innerHTML;
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
  for (const item of list) {
    applyPatch(item);
  }
  return true;
}

registerPatches(applyPatches);
