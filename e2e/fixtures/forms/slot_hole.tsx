import { patch, type ReadArgs, type WriteArgs } from "dashi";

function SlotHole({ item }: { item?: string }) {
  return (
    <div id="hole">
      <p id="hole-item">{item ?? "empty"}</p>
      <form id="hole-write" method="POST" action="/slot-hole">
        <input id="hole-write-title" name="title" />
        <button id="hole-write-submit" type="submit">Add</button>
      </form>
      <form id="hole-get" method="GET" action="/search">
        <input id="hole-get-q" name="q" />
        <button id="hole-get-submit" type="submit">Find</button>
      </form>
    </div>
  );
}

export function list({ html }: ReadArgs) {
  return html(<SlotHole />);
}

export async function update({ ctx, patches }: WriteArgs) {
  const title = (await ctx.req.formData()).get("title");
  const text = typeof title === "string" && title !== "" ? title : "item";
  return patches([patch.replace("#hole", <SlotHole item={text} />)]);
}
