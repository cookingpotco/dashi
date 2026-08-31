export function list() {
  return (
    <span id="current-time">
      Current time: {new Date().toISOString()}
    </span>
  );
}
