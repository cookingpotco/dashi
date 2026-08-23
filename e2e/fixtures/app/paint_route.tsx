import { client } from "dashi";

const Paint = client.module(
  new URL("./paint_client.ts", import.meta.url),
);

export function PaintPage() {
  return (
    <div>
      <p id="paint-target">pending</p>
      <Paint />
    </div>
  );
}
