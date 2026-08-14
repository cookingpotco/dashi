import { type Element } from "../jsx-runtime/jsx_types.ts";
import { Layout, REQUEST_HEADERS, Route } from "../shared/mod.ts";

// TODO: Replace with async local storage
// This doesn't work for concurrent requests
export class RenderStorage {
  private static instance: RenderStorage;

  private readonly inflightFragments: Map<string, Promise<string | null>>;
  private _req: Request | null;

  private constructor() {
    this.inflightFragments = new Map();
    this._req = null;
  }

  static getInstance() {
    if (RenderStorage.instance) {
      return RenderStorage.instance;
    }

    RenderStorage.instance = new RenderStorage();

    return RenderStorage.instance;
  }

  get req() {
    return this._req;
  }

  get size() {
    return this.inflightFragments.size;
  }

  init(req: Request) {
    this.inflightFragments.clear();
    this._req = req;
  }

  addFragment(src: string, promise: Promise<string | null>) {
    if (!this.inflightFragments.has(src)) {
      this.inflightFragments.set(src, promise);
    }
  }

  hasFragment(src: string) {
    return this.inflightFragments.has(src);
  }

  get unresolvedFragments() {
    return this.inflightFragments.entries().map(async (
      [src, promise],
    ) => ({ src, content: await promise }));
  }
}

interface RenderRouteOptions {
  req: Request;
  layouts: Layout[];
}

export async function renderRoute(
  route: Route,
  options: RenderRouteOptions,
): Promise<Element> {
  const [layout, ...rest] = options.layouts;

  if (!layout || options.req.headers.has(REQUEST_HEADERS.FRAGMENT)) {
    return await route.render(options.req);
  }

  return layout.render(
    options.req,
    await renderRoute(route, { ...options, layouts: rest }),
  );
}

export function getFragmentSlot(src: string) {
  return `{{fragment:${src}}}`;
}

export async function replaceFragmentSlots(html: string): Promise<string> {
  const store = RenderStorage.getInstance();
  let seen = 0;

  while (store.size > seen) {
    seen = store.size;
    const fragments = await Promise.all(store.unresolvedFragments);

    for (const fragment of fragments) {
      html = html.replaceAll(
        getFragmentSlot(fragment.src),
        fragment.content || "",
      );
    }
  }

  return html;
}
