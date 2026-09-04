import {
  group,
  type MiddlewareArgs,
  type ReadArgs,
  RouteFragment,
} from "dashi";
import type { AppState } from "../state.ts";

function embedOnly({ ctx, next }: MiddlewareArgs<AppState>) {
  ctx.state.embedOnly = "yes";
  return next();
}

export const embed = group<AppState>(({ route }) => ({
  middleware: [embedOnly],
  routes: [route("/embed", { GET: Embed })],
}));

function Embed({ html }: ReadArgs<Record<string, never>, AppState>) {
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
