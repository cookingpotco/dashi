let hits = 0;

export function Counted() {
  hits += 1;
  return <p id="counted">counted</p>;
}

export function countedHitCount(): number {
  return hits;
}
