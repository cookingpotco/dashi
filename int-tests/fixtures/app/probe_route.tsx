import { client } from "dashi";

const Probe = client.element(
  "probe-el",
  new URL("./probe_client.ts", import.meta.url),
);

export function ProbePage() {
  return (
    <div>
      <Probe id="probe">probe-body</Probe>
      <Probe id="probe-b">probe-b</Probe>
    </div>
  );
}
