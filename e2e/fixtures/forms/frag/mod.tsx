import { type Ctx, group, patch } from "dashi";

export const frag = group("/frag", ({ route }) => ({
  routes: [route("/", { GET: list, POST: update })],
}));

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

function list() {
  return <Frag />;
}

async function update(ctx: Ctx) {
  const title = (await ctx.req.formData()).get("title");
  const text = typeof title === "string" && title !== "" ? title : "item";
  return [patch.replace("/frag", <Frag item={text} />)];
}
