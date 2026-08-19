import { type Element } from "../jsx-runtime/jsx_types.ts";
import { error as logError } from "../logging/mod.ts";
import { type Ctx } from "../shared/mod.ts";
import { type GroupBoundary } from "./table.ts";
import { renderBoundaries, RenderKind } from "../ssr/mod.ts";

const DEFAULT_ERROR_FALLBACK_BODY = "Something Went Wrong";

export function lastResort(
  isFragment: boolean,
  errorFallback: Element | Response | undefined,
): Element | Response {
  if (isFragment) {
    return new Response("", { status: 500 });
  }
  if (errorFallback === undefined) {
    return new Response(DEFAULT_ERROR_FALLBACK_BODY, { status: 500 });
  }
  return errorFallback;
}

async function recoverFragment<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  thrown: unknown,
  boundary: GroupBoundary<State> | undefined,
  ctx: Ctx<Record<string, string>, State>,
  errorFallback: Element | Response | undefined,
): Promise<Element | Response> {
  try {
    if (!boundary?.error) {
      return lastResort(true, errorFallback);
    }
    return await boundary.error(ctx, thrown);
  } catch (nextThrown) {
    logError(nextThrown);
    return lastResort(true, errorFallback);
  }
}

export async function recover<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  thrown: unknown,
  boundary: GroupBoundary<State> | undefined,
  ctx: Ctx<Record<string, string>, State>,
  errorFallback: Element | Response | undefined,
): Promise<Element | Response> {
  logError(thrown);

  if (ctx.isFragment) {
    return await recoverFragment(thrown, boundary, ctx, errorFallback);
  }

  for (
    let current = boundary;
    current;
    current = current.parent
  ) {
    if (!current.error) {
      continue;
    }
    let errorResult: Element | Response;
    try {
      errorResult = await current.error(ctx, thrown);
    } catch (nextThrown) {
      thrown = nextThrown;
      logError(thrown);
      continue;
    }
    if (errorResult instanceof Response) {
      return errorResult;
    }

    const wrapped = await renderBoundaries(errorResult, {
      ctx,
      boundary: current,
    });
    if (wrapped.kind === RenderKind.Thrown) {
      return await recover(
        wrapped.thrown,
        wrapped.parent,
        ctx,
        errorFallback,
      );
    }

    return wrapped.page;
  }

  return lastResort(false, errorFallback);
}
