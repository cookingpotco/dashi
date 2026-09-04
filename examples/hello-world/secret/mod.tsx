import { type ReadArgs } from "dashi";

export function Secret({ html }: ReadArgs) {
  return html(
    <html>
      <h2>{"<3"}</h2>
    </html>,
  );
}
