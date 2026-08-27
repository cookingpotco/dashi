import { registerActions } from "../client/registry_client.ts";
import "../forms/submit_client.ts";

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

function applyActions(html: string): boolean {
  const template = document.createElement("template");
  template.innerHTML = html;
  const list: Element[] = [];
  for (const node of template.content.childNodes) {
    if (!(node instanceof Element)) {
      continue;
    }
    if (node.localName !== "route-action") {
      return false;
    }
    list.push(node);
  }
  if (list.length === 0) {
    return false;
  }
  for (const action of list) {
    applyAction(action);
  }
  return true;
}

registerActions(applyActions);
