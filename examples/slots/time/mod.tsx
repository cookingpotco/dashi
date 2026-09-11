import { type ReadArgs } from "dashi";

export function CurrentTimeText() {
  return <>Current time: {new Date().toISOString()}</>;
}

export function CurrentTime() {
  return (
    <span id="current-time">
      <CurrentTimeText />
    </span>
  );
}

export function list({ html }: ReadArgs) {
  return html(<CurrentTime />);
}
