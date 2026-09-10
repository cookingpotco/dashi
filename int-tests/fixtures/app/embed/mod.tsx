import { group, type MiddlewareArgs, type ReadArgs, RouteSlot } from "dashi";
import type { AppState } from "../state.ts";

function embedOnly({ ctx, next }: MiddlewareArgs<AppState>) {
  ctx.state.embedOnly = "yes";
  return next();
}

export const embed = group<AppState>(({ route }) => ({
  middleware: [embedOnly],
  routes: [route("/embed", { GET: Embed })],
}));

function Embed({ html }: ReadArgs<{ state: AppState }>) {
  return html(
    <div>
      <section id="connect">
        <RouteSlot src="/slot" />
        <RouteSlot src="/peer" />
      </section>
      <section id="visible">
        <RouteSlot
          src="/slot"
          fetchWhen="visible"
          fallback={<span id="fallback">Loading...</span>}
        />
      </section>
    </div>,
  );
}
