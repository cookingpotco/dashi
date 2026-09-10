import { group, patch, type ReadArgs, type WriteArgs } from "dashi";
import { CurrentTime } from "../time/mod.tsx";
import { todos as items } from "../todos.ts";

export const todos = group("/todos", ({ route }) => ({
  routes: [
    route("/", { GET: list, POST: create }),
    route("/count", { GET: count }),
  ],
}));

export function TodoList({ error }: { error?: string }) {
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

export function TodoCount() {
  return <span id="todo-count">{items.length}</span>;
}

function list({ html }: ReadArgs) {
  return html(<TodoList />);
}

function count({ html }: ReadArgs) {
  return html(<TodoCount />);
}

async function create({ ctx, patches }: WriteArgs) {
  const title = (await ctx.req.formData()).get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return patches([
      patch.update("#todos-root", <TodoList error="title is required" />),
    ]);
  }
  items.push(title);
  return patches([
    patch.append("#todos", <li>{title}</li>),
    patch.update(
      "#todo-count",
      <span id="todo-count">{items.length}</span>,
    ),
    patch.update("#current-time", <CurrentTime />),
  ]);
}
