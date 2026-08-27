let hits = 0;

export function list() {
  hits += 1;
  return <span id="refresh-stamp">{hits}</span>;
}
