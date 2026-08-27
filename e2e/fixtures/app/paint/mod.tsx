import { client, group } from "dashi";

const Paint = client.module(
  new URL("./paint_client.ts", import.meta.url),
);

export const paint = group("/paint", ({ route }) => ({
  routes: [route("/", { GET: PaintPage })],
}));

function PaintPage() {
  return (
    <div>
      <p id="paint-target">pending</p>
      <Paint />
    </div>
  );
}
