import { client, type Ctx, fragment, group } from "dashi";

const TodoErrorMark = client.element(
  "todo-error-el",
  new URL("./todo_error_client.ts", import.meta.url),
);

const items: string[] = [];

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
      {error ? <TodoErrorMark /> : null}
      <form id="todos-form" method="POST" action="/todos">
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
  return [fragment.replace("/todos", <TodoList />)];
}
