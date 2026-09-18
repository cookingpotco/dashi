import type { ReadArgs } from "dashi";

export function Home({ html }: ReadArgs) {
  return html(
    <main>
      <div id="box" className="flex p-4">
        <span id="label">styled</span>
      </div>
    </main>,
  );
}
