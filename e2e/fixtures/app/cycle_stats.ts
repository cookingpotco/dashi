const hits = new Map<string, number>();

export function recordCycleHit(path: string): void {
  hits.set(path, (hits.get(path) ?? 0) + 1);
}

export function resetCycleHits(): void {
  hits.clear();
}

export function cycleHitCounts(): Record<string, number> {
  return Object.fromEntries(hits);
}
