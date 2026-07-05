import { getInlineFragmentSlot } from "dashi/jsx-runtime";
import { Layout, Route } from "../shared/shared_types.ts";

// TODO: Replace with async local storage
// This doesn't work for concurrent requests
export class RenderStorage {
  private static readonly instance: RenderStorage;

  private readonly inflightFragments: Map<string, Promise<string | null>>;
  private _req: Request | null;

  private constructor() {
    this.inflightFragments = new Map();
    this._req = null;
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    return new RenderStorage();
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
): Promise<string> {
  const [layout, ...rest] = options.layouts;

  if (!layout || options.inlineFragment) {
    const res = `${(await route.render(options.req))}`;
    replaceInlineFragmentSlots(res);

    return res;
  }

  const res = layout.render(
    options.req,
    await renderRoute(route, { ...options, layouts: rest }),
  );

  return `${res}`;
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
