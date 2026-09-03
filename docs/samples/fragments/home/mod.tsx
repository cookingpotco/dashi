import { RouteFragment } from "dashi";

export function Home() {
  return (
    <main>
      <h1>Todos</h1>
      <p>
        Count: <RouteFragment src="/todos/count" />
      </p>
      <RouteFragment src="/todos" />
      <RouteFragment
        src="/weather"
        lazy
        fallback={<p>Loading weather…</p>}
      />
      <RouteFragment
        src="/spotlight"
        lazy="visible"
        fallback={<p>Scroll to load</p>}
      />
    </main>
  );
}
