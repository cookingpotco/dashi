import { type Ctx, fragment, group } from "dashi";
import { todos as items } from "../todos.ts";

export const todos = group("/todos", ({ route }) => ({
  routes: [route("/", { GET: list, POST: create })],
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

function list() {
  return <TodoList />;
}

async function create(ctx: Ctx) {
  const title = (await ctx.req.formData()).get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return [fragment.replace("/todos", <TodoList error="title is required" />)];
  }
  items.push(title);
  return [
    fragment.append("/todos", <li>{title}</li>),
    fragment.replace("/todo-count", <span>{items.length}</span>),
    fragment.refresh("/time"),
  ];
}
