import { client, type Ctx } from "dashi";

const TodoErrorMark = client.element(
  "todo-error-el",
  new URL("./todo_error_client.ts", import.meta.url),
);

const todos: string[] = [];

function TodoList({ error }: { error?: string }) {
  return (
    <div>
      <ul id="todos">
        {todos.map((t) => <li>{t}</li>)}
      </ul>
      {error ? <p id="todo-error">{error}</p> : null}
      {error ? <TodoErrorMark /> : null}
      <form id="todos-form" method="POST" action="/todos">
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
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const title = (await ctx.req.formData()).get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return <TodoList error="title is required" />;
  }
  todos.push(title);
  return <TodoList />;
}
