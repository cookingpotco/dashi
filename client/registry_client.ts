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
 * Fetch `url` and swap the connected `<navigation-root>` in place.
 * Pushes history and scrolls to the top, or to the hash target.
 * Without a page host, or when the response cannot be swapped, does a
 * real navigation.
 */
export function navigate(url: string | URL): Promise<void> {
  if (page !== null) {
    return Promise.resolve(page.navigate(url));
  }
  location.assign(new URL(url, location.href).href);
  return Promise.resolve();
}

export async function submitWrite(intent: SubmitIntent): Promise<void> {
  try {
    const res = await fetch(intent.url, {
      method: intent.method,
      headers: { Accept: "text/html" },
      body: intent.body,
    });
    if (new URL(res.url, location.href).origin !== location.origin) {
      location.assign(res.url);
      return;
    }
    if (res.redirected) {
      if (page !== null) {
        await page.commitDocument(res, res.url);
        return;
      }
      location.assign(res.url);
      return;
    }
    if (actions !== null) {
      const html = await res.text();
      if (actions(html)) {
        return;
      }
    }
    location.assign(res.url);
  } catch {
    return;
  }
}
