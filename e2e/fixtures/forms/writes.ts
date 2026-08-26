let writes = 0;

export function recordWrite(): void {
  writes += 1;
}

export function writeCount(): number {
  return writes;
}
