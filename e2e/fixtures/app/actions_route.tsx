import { type Ctx, fragment } from "dashi";

export function form() {
  return (
    <form id="actions-form" method="POST" action="/actions">
      <input name="title" />
      <button type="submit">Add</button>
    </form>
  );
}

export async function apply(ctx: Ctx) {
  const title = (await ctx.req.formData()).get("title");
  const text = typeof title === "string" && title !== "" ? title : "item";
  return [
    fragment.append("/todos", <li id="appended-todo">{text}</li>),
    fragment.replace("/todo-count", <span id="todo-count">1</span>),
    fragment.refresh("/hits"),
  ];
}
