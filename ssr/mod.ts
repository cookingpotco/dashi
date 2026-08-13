import { getInlineFragmentSlot } from "dashi/jsx-runtime";
import { TrustedHtml } from "../jsx-runtime/jsx_types.ts";
import { Layout, Route } from "../shared/shared_types.ts";

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
  inlineFragment?: boolean;
}

export async function renderRoute(
  route: Route,
  options: RenderRouteOptions,
): Promise<TrustedHtml> {
  const [layout, ...rest] = options.layouts;

  if (!layout || options.inlineFragment) {
    const res = await route.render(options.req);
    replaceInlineFragmentSlots(String(res));

    return res;
  }

  return layout.render(
    options.req,
    await renderRoute(route, { ...options, layouts: rest }),
  );
}

export async function replaceInlineFragmentSlots(initialOutput: string) {
  const fragments = await Promise.all(
    RenderStorage.getInstance().unresolvedFragments,
  );

  for (const fragment of fragments) {
    initialOutput.replaceAll(
      getInlineFragmentSlot(fragment.src),
      fragment.content || "",
    );
  }
}
