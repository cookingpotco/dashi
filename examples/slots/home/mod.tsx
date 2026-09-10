import { type ReadArgs, RouteSlot } from "dashi";
import { FragmentContent, fetchActivity } from "../fragment/mod.tsx";
import { Notice } from "../notice/mod.tsx";
import { CurrentTime } from "../time/mod.tsx";
import { TodoCount, TodoList } from "../todos/mod.tsx";

function fetchData() {
  return new Promise<{ hello: number }>((resolve) =>
    setTimeout(() => resolve({ hello: Math.random() }), 1000)
  );
}

const TestComponent = ({ text }: { text: string }) => {
  return <footer>Test Footer {text} 2</footer>;
};

export async function Home({ html }: ReadArgs) {
  const [{ hello }, activity] = await Promise.all([
    fetchData(),
    fetchActivity(),
  ]);

  return html(
    <main>
      <h1>
        Random number: {hello.toFixed(2)}
      </h1>
      <TestComponent text="my footy" />
      <p>
        Todos: <TodoCount />
      </p>
      <p>
        <CurrentTime />
      </p>
      <Notice />
      <div id="todos-root">
        <TodoList />
      </div>
      <FragmentContent activity={activity} />
      <RouteSlot
        src="/fragment"
        fetchWhen="visible"
        fallback={<span id="123">Loading...</span>}
      />
    </main>,
  );
}
