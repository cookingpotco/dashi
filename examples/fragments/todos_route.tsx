import { type Ctx, fragment } from "dashi";
import { todos } from "./todos.ts";

function TodoList({ error }: { error?: string }) {
  return (
    <div>
      <ul id="todos">
        {todos.map((t) => <li>{t}</li>)}
      </ul>
      {error ? <p id="todo-error">{error}</p> : null}
      <form method="POST" action="/todos">
        <input name="title" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export function list() {
  return <TodoList />;
}

export async function create(ctx: Ctx) {
  const title = (await ctx.req.formData()).get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return [fragment.replace("/todos", <TodoList error="title is required" />)];
  }
  todos.push(title);
  return [
    fragment.append("/todos", <li>{title}</li>),
    fragment.replace("/todo-count", <span>{todos.length}</span>),
    fragment.refresh("/time"),
  ];
}
