import { client, type Ctx, fragment } from "dashi";

const AppendMark = client.element(
  "append-el",
  new URL("./append_client.ts", import.meta.url),
);

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
    fragment.append("/todos", <AppendMark id="appended-mark" />),
    fragment.replace("/todo-count", <span id="todo-count">1</span>),
  ];
}
