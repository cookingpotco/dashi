import { client, type Ctx, type Html } from "dashi";

const Probe = client.element(
  "probe-el",
  new URL("./probe_client.ts", import.meta.url),
);

export function ProbePage(_ctx: Ctx, html: Html) {
  return html(<Probe id="probe">probe-body</Probe>);
}
