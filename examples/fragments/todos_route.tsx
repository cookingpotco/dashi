import type { Ctx } from "dashi";

const todos: string[] = [];

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
    return <TodoList error="title is required" />;
  }
  todos.push(title);
  return <TodoList />;
}
