import { type Ctx, group, patch, type SealHtml, type SealPatches } from "dashi";
import { todos as items } from "../todos.ts";

export const todos = group("/todos", ({ route }) => ({
  routes: [
    route("/", { GET: list, POST: create }),
    route("/count", { GET: count }),
  ],
}));

function TodoList({ error }: { error?: string }) {
  return (
    <div>
      <ul id="todos">
        {items.map((t) => <li>{t}</li>)}
      </ul>
      {error ? <p id="todo-error">{error}</p> : null}
      <form method="POST" action="/todos">
        <input name="title" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

function list(_ctx: Ctx, html: SealHtml) {
  return html(<TodoList />);
}

function count(_ctx: Ctx, html: SealHtml) {
  return html(<span id="todo-count">{items.length}</span>);
}

async function create(ctx: Ctx, patches: SealPatches) {
  const title = (await ctx.req.formData()).get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return patches([
      patch.replace("/todos", <TodoList error="title is required" />),
    ]);
  }
  items.push(title);
  return patches([
    patch.append("#todos", <li>{title}</li>),
    patch.replace(
      "/todos/count",
      <span id="todo-count">{items.length}</span>,
    ),
    patch.refresh("/time"),
  ]);
}
