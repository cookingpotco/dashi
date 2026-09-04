import { type ReadArgs } from "dashi";

export function Wrote({ html }: ReadArgs) {
  return html(
    <div>
      <h1 id="heading">wrote</h1>
    </div>,
  );
}
