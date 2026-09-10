const hits = new Map<string, number>();

export function recordDepthHit(path: string): void {
  hits.set(path, (hits.get(path) ?? 0) + 1);
}

export function resetDepthHits(): void {
  hits.clear();
}

export function depthHitCounts(): Record<string, number> {
  return Object.fromEntries(hits);
}
