let count = 0;

export function list() {
  count += 1;
  return <span id="refresh-stamp">{count}</span>;
}
