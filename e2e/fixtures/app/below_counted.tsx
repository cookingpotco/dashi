let hits = 0;

export function BelowCounted() {
  hits += 1;
  return <p id="below-counted">below-counted</p>;
}

export function belowHitsHandler() {
  return new Response(String(hits));
}
