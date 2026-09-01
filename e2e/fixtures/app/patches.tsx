import { type Ctx, patch } from "dashi";

export function form() {
  return (
    <form id="patches-form" method="POST" action="/patches">
      <input name="title" />
      <button type="submit">Add</button>
    </form>
  );
}

export async function apply(ctx: Ctx) {
  const title = (await ctx.req.formData()).get("title");
  const text = typeof title === "string" && title !== "" ? title : "item";
  return [
    patch.append("#todos", <li id="appended-todo">{text}</li>),
    patch.replace("/todo-count", <span id="todo-count">1</span>),
    patch.replace("#status", <p>Saved</p>),
    patch.refresh("/hits"),
  ];
}
