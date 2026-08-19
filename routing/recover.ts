import { type Element } from "../jsx-runtime/jsx_types.ts";
import { error as logError } from "../logging/mod.ts";
import { type Ctx } from "../shared/mod.ts";
import { type GroupBoundary } from "./path.ts";
import { renderBoundaries } from "../ssr/mod.ts";

const EMPTY_PAGE = "" as Element;
const DEFAULT_ERROR_FALLBACK_BODY = "Something Went Wrong";

export type RouteResult = {
  html: string | undefined;
  res: Response;
};

export function htmlResponse(body: string, status: number): Response {
  const res = new Response(body, { status });
  res.headers.set("Content-Type", "text/html");
  return res;
}

export function lastResort(
  isFragment: boolean,
  errorFallback: Element | Response | undefined,
): Response {
  if (isFragment) {
    return new Response("", { status: 500 });
  }
  if (errorFallback === undefined) {
    return new Response(DEFAULT_ERROR_FALLBACK_BODY, { status: 500 });
  }
  if (errorFallback instanceof Response) {
    return errorFallback;
  }
  return htmlResponse(`<!DOCTYPE html>${errorFallback}`, 500);
}

async function recoverFragment<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  thrown: unknown,
  boundary: GroupBoundary<State> | undefined,
  ctx: Ctx<Record<string, string>, State>,
  errorFallback: Element | Response | undefined,
): Promise<RouteResult> {
  try {
    if (!boundary?.error) {
      return { html: undefined, res: lastResort(true, errorFallback) };
    }
    const errorResult = await boundary.error(ctx, thrown);
    if (errorResult instanceof Response) {
      return { html: undefined, res: errorResult };
    }
    const html = String(errorResult);
    return { html, res: htmlResponse(html, 500) };
  } catch (nextThrown) {
    logError(nextThrown);
    return { html: undefined, res: lastResort(true, errorFallback) };
  }
}

export async function recover<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  thrown: unknown,
  boundary: GroupBoundary<State> | undefined,
  ctx: Ctx<Record<string, string>, State>,
  errorFallback: Element | Response | undefined,
): Promise<RouteResult> {
  logError(thrown);

  if (ctx.isFragment) {
    return await recoverFragment(thrown, boundary, ctx, errorFallback);
  }

  let current = boundary;
  while (current) {
    let errorResult: Element | Response;
    try {
      errorResult = current.error
        ? await current.error(ctx, thrown)
        : EMPTY_PAGE;
    } catch (nextThrown) {
      thrown = nextThrown;
      logError(thrown);
      current = current.parent;
      continue;
    }
    if (errorResult instanceof Response) {
      return { html: undefined, res: errorResult };
    }

    const wrapped = await renderBoundaries(errorResult, {
      ctx,
      boundary: current,
    });
    if ("thrown" in wrapped) {
      thrown = wrapped.thrown;
      logError(thrown);
      current = wrapped.parent;
      continue;
    }

    const html = String(wrapped.page);
    return { html, res: htmlResponse(`<!DOCTYPE html>${html}`, 500) };
  }

  return { html: undefined, res: lastResort(false, errorFallback) };
}
