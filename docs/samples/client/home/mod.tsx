import { client } from "dashi";

const Clock = client.element(
  "dashi-clock",
  new URL("../clock_client.ts", import.meta.url),
);

const Analytics = client.module(
  new URL("../analytics_client.ts", import.meta.url),
);

export function Home() {
  return (
    <main>
      <h1>Client JS</h1>
      <Clock />
      <Analytics />
    </main>
  );
}
