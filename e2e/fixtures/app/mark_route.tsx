import { client } from "dashi";

const Mark = client.element(
  "mark-el",
  new URL("./mark_client.ts", import.meta.url),
);

export function MarkPage() {
  return (
    <div>
      <Mark id="mark-a" />
      <Mark id="mark-b" />
    </div>
  );
}
