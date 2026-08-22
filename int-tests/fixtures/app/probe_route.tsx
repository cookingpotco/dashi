import { client } from "dashi";

const Probe = client.element(
  "probe-el",
  new URL("./probe.client.ts", import.meta.url),
);

export function ProbePage() {
  return <Probe id="probe">probe-body</Probe>;
}
