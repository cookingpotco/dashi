import { type Ctx, type Html, RouteFragment } from "dashi";

function fetchData() {
  return new Promise<{ hello: number }>((resolve) =>
    setTimeout(() => resolve({ hello: Math.random() }), 1000)
  );
}

const TestComponent = ({ text }: { text: string }) => {
  return <footer>Test Footer {text} 2</footer>;
};

export async function Home(_ctx: Ctx, html: Html) {
  const { hello } = await fetchData();

  return html(
    <main>
      <h1>
        Random number: {hello.toFixed(2)}
      </h1>
      <TestComponent text="my footy" />
      <p>
        Todos: <RouteFragment src="/todos/count" />
      </p>
      <p>
        <RouteFragment src="/time" />
      </p>
      <RouteFragment src="/notice" />
      <RouteFragment src="/todos" />
      <RouteFragment src="/fragment" />
      <RouteFragment
        src="/fragment"
        lazy
        fallback={<span id={`123`}>Loading...</span>}
      />
    </main>,
  );
}
