import type { Ctx, Element } from "dashi";
import { RootLayout } from "./root_layout.tsx";

export function pageResponse(ctx: Ctx, page: Element): Response {
  return new Response(`<!DOCTYPE html>${RootLayout(ctx, page)}`, {
    headers: { "content-type": "text/html" },
  });
}
