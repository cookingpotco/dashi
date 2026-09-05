import { client, type ReadArgs } from "dashi";
import type { AppState } from "./state.ts";

const Probe = client.element(
  "probe-el",
  new URL("./probe_client.ts", import.meta.url),
);

export function ProbePage({ html }: ReadArgs<AppState>) {
  return html(<Probe id="probe">probe-body</Probe>);
}
