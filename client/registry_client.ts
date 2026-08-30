export interface SubmitIntent {
  readonly method: string;
  readonly url: string;
  readonly body: FormData | URLSearchParams;
}

interface PageSlot {
  navigate: (url: string | URL) => void | Promise<void>;
  commitDocument: (res: Response, destUrl: string) => void | Promise<void>;
}

let page: PageSlot | null = null;
let actions: ((html: string) => boolean) | null = null;

export function registerPage(slot: PageSlot): void {
  page = slot;
}

export function registerActions(apply: (html: string) => boolean): void {
  actions = apply;
}

/**
 * Browser-only. Fetch `url` and swap the connected `<navigation-root>`
 * in place. Pushes history and scrolls to the top, or to the hash
 * target. Without a page host, or when the response cannot be swapped,
 * does a real navigation.
 *
 * @param url Destination, resolved against `location.href` if relative.
 *
 * @example
 * ```ts
 * import { navigate } from "dashi/client";
 * await navigate("/about");
 * ```
 */
export function navigate(url: string | URL): Promise<void> {
  if (page !== null) {
    return Promise.resolve(page.navigate(url));
  }
  location.assign(new URL(url, location.href).href);
  return Promise.resolve();
}

export async function submitWrite(intent: SubmitIntent): Promise<boolean> {
  try {
    const res = await fetch(intent.url, {
      method: intent.method,
      headers: { Accept: "text/html" },
      body: intent.body,
    });
    if (new URL(res.url, location.href).origin !== location.origin) {
      location.assign(res.url);
      return false;
    }
    if (res.redirected) {
      if (page !== null) {
        await page.commitDocument(res, res.url);
        return false;
      }
      location.assign(res.url);
      return false;
    }
    if (actions !== null) {
      const html = await res.text();
      const link = res.headers.get("link") ?? "";
      const pending: Promise<unknown>[] = [];
      for (const match of link.matchAll(/<([^>]+)>;\s*rel="modulepreload"/g)) {
        const href = match[1];
        if (href !== undefined) {
          pending.push(import(new URL(href, location.href).href));
        }
      }
      await Promise.all(pending);
      if (actions(html)) {
        return true;
      }
    }
    location.assign(res.url);
    return false;
  } catch {
    return false;
  }
}
