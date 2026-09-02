let hits = 0;

export function VisibleCounted() {
  hits += 1;
  return <p id="visible-counted">visible-counted</p>;
}

export function visibleHitsHandler() {
  return new Response(String(hits));
}
