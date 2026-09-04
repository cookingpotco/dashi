import {
  type Ctx,
  group,
  RouteFragment,
  type SealHtml,
  type WrapperCtx,
} from "dashi";
import type { AppState } from "../state.ts";

function embedOnly(ctx: WrapperCtx<AppState>, next: () => Promise<Response>) {
  ctx.state.embedOnly = "yes";
  return next();
}

export const embed = group<AppState>(({ route }) => ({
  middleware: [embedOnly],
  routes: [route("/embed", { GET: Embed })],
}));

function Embed(_ctx: Ctx<Record<string, never>, AppState>, html: SealHtml) {
  return html(
    <div>
      <section id="eager">
        <RouteFragment src="/fragment" />
        <RouteFragment src="/peer" />
      </section>
      <section id="lazy">
        <RouteFragment
          src="/fragment"
          lazy
          fallback={<span id="fallback">Loading...</span>}
        />
      </section>
    </div>,
  );
}
