import { client, type Ctx, type Html } from "dashi";
import type { AppState } from "./state.ts";

const Probe = client.element(
  "probe-el",
  new URL("./probe_client.ts", import.meta.url),
);

export function ProbePage(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<Probe id="probe">probe-body</Probe>);
}
