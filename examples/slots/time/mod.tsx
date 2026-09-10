import { type ReadArgs } from "dashi";

export function CurrentTime() {
  return (
    <span id="current-time">
      Current time: {new Date().toISOString()}
    </span>
  );
}

export function list({ html }: ReadArgs) {
  return html(<CurrentTime />);
}
