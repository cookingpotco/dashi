import { type Ctx, patch, type SealHtml, type SealPatches } from "dashi";

export function form(_ctx: Ctx, html: SealHtml) {
  return html(
    <form id="patches-form" method="POST" action="/patches">
      <input name="title" />
      <button type="submit">Add</button>
    </form>,
  );
}

export async function apply(ctx: Ctx, patches: SealPatches) {
  const title = (await ctx.req.formData()).get("title");
  const text = typeof title === "string" && title !== "" ? title : "item";
  return patches([
    patch.append("#todos", <li id="appended-todo">{text}</li>),
    patch.replace("/todo-count", <span id="todo-count">1</span>),
    patch.replace("#status", <p>Saved</p>),
    patch.refresh("/hits"),
  ]);
}
