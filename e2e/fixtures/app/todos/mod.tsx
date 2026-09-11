import { client, patch, type ReadArgs, type WriteArgs } from "dashi";

const TodoErrorMark = client.element(
  "todo-error-el",
  new URL("./todo_error_client.ts", import.meta.url),
);

const items: string[] = [];

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

export function list({ html }: ReadArgs) {
  return html(
    <div id="todos-root">
      <TodoList />
    </div>,
  );
}

export async function create({ ctx, patches }: WriteArgs) {
  const title = (await ctx.req.formData()).get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return patches([
      patch.update("#todos-root", <TodoList error="title is required" />),
    ]);
  }
  items.push(title);
  return patches([patch.update("#todos-root", <TodoList />)]);
}
