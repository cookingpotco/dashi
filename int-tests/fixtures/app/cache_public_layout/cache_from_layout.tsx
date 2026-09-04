import type { Ctx, Html } from "dashi";

export function CacheFromLayout(_ctx: Ctx, html: Html) {
  return html(<p id="cache-from-layout">from-handler</p>);
}
