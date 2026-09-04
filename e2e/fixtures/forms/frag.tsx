import { type Ctx, type Html, patch, type Patches } from "dashi";

function Frag({ item }: { item?: string }) {
  return (
    <div>
      <p id="frag-item">{item ?? "empty"}</p>
      <form id="frag-write" method="POST" action="/frag">
        <input id="frag-write-title" name="title" />
        <button id="frag-write-submit" type="submit">Add</button>
      </form>
      <form id="frag-get" method="GET" action="/search">
        <input id="frag-get-q" name="q" />
        <button id="frag-get-submit" type="submit">Find</button>
      </form>
    </div>
  );
}

export function list(_ctx: Ctx, html: Html) {
  return html(<Frag />);
}

export async function update(ctx: Ctx, patches: Patches) {
  const title = (await ctx.req.formData()).get("title");
  const text = typeof title === "string" && title !== "" ? title : "item";
  return patches([patch.replace("/frag", <Frag item={text} />)]);
}
